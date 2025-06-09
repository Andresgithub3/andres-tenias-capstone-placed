import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const DocumentList = ({ 
  documents = [], 
  loading = false,
  onDownload,
  onDelete,
  onSetPrimary,
  showPrimaryActions = true
}) => {
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  const handleDownload = async (document) => {
    setDownloadingIds(prev => new Set(prev).add(document.id));
    try {
      await onDownload(document);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (document) => {
    setDeletingIds(prev => new Set(prev).add(document.id));
    try {
      await onDelete(document);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="text.secondary">
          No documents uploaded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Typography variant="body2" fontWeight={doc.is_primary ? 600 : 400}>
                  {doc.file_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={doc.document_type} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(doc.file_size)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </Typography>
              </TableCell>
              <TableCell>
                {doc.is_primary && (
                  <Chip 
                    label="Primary" 
                    size="small" 
                    color="primary"
                    icon={<StarIcon />}
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {/* Download Button */}
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingIds.has(doc.id)}
                    title="Download"
                  >
                    {downloadingIds.has(doc.id) ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DownloadIcon fontSize="small" />
                    )}
                  </IconButton>

                  {/* Set Primary Button */}
                  {showPrimaryActions && doc.document_type === 'resume' && !doc.is_primary && (
                    <IconButton
                      size="small"
                      onClick={() => onSetPrimary(doc)}
                      title="Make Primary"
                    >
                      <StarBorderIcon fontSize="small" />
                    </IconButton>
                  )}

                  {/* Delete Button */}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingIds.has(doc.id)}
                    title="Delete"
                    color="error"
                  >
                    {deletingIds.has(doc.id) ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentList;