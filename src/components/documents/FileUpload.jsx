import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { storageService } from '../../services/storageService';
import PrimaryDialog from './PrimaryDialog';

const FileUpload = ({ 
  entityType, 
  entityId, 
  documentType,
  onUploadSuccess,
  onUploadError,
  allowedTypes = null, // Override document types if needed
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedDocType, setSelectedDocType] = useState(documentType || '');
  const [primaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Get available document types based on entity
  const getDocumentTypes = () => {
    if (allowedTypes) return allowedTypes;
    
    const types = {
      candidate: [
        { value: 'resume', label: 'Resume' },
        { value: 'portfolio', label: 'Portfolio' },
        { value: 'certification', label: 'Certification' },
        { value: 'other', label: 'Other' }
      ],
      company: [
        { value: 'contract', label: 'Contract' },
        { value: 'agreement', label: 'Agreement' },
        { value: 'other', label: 'Other' }
      ]
    };
    
    return types[entityType] || [];
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && selectedDocType) {
      handleUpload(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleUpload = async (file) => {
    if (!selectedDocType) {
      setError('Please select a document type first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const result = await storageService.uploadFile(
        file,
        entityType,
        entityId,
        selectedDocType,
        (progress) => setUploadProgress(progress)
      );

      setUploadedFile(result);

      // If it's a resume and NOT the first one, ask about making it primary
      if (selectedDocType === 'resume' && !result.isFirstResume) {
        setPrimaryDialogOpen(true);
      } else {
        // Call success callback
        onUploadSuccess?.(result);
      }

    } catch (err) {
      setError(err.message);
      onUploadError?.(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePrimaryConfirm = async () => {
    try {
      await storageService.setPrimaryDocument(
        uploadedFile.document.id,
        entityId,
        selectedDocType
      );
      
      setPrimaryDialogOpen(false);
      onUploadSuccess?.({ ...uploadedFile, madePrimary: true });
    } catch (err) {
      setError('Failed to set as primary: ' + err.message);
    }
  };

  const handlePrimaryCancel = () => {
    setPrimaryDialogOpen(false);
    onUploadSuccess?.(uploadedFile);
  };

  return (
    <Box>
      {/* Document Type Selector */}
      {!documentType && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={selectedDocType}
            label="Document Type"
            onChange={(e) => setSelectedDocType(e.target.value)}
            disabled={disabled || uploading}
          >
            {getDocumentTypes().map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Upload Area */}
      <Box
        sx={{
          border: 2,
          borderColor: 'primary.main',
          borderStyle: 'dashed',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: 'action.hover',
          cursor: disabled || uploading || !selectedDocType ? 'not-allowed' : 'pointer',
          opacity: disabled || uploading || !selectedDocType ? 0.5 : 1,
          '&:hover': {
            bgcolor: disabled || uploading || !selectedDocType ? 'action.hover' : 'action.selected'
          }
        }}
        onClick={() => {
          if (!disabled && !uploading && selectedDocType) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          disabled={disabled || uploading || !selectedDocType}
        />

        {uploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6">
              Upload {selectedDocType ? getDocumentTypes().find(t => t.value === selectedDocType)?.label : 'Document'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click to browse files
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Primary Dialog */}
      <PrimaryDialog
        open={primaryDialogOpen}
        onClose={handlePrimaryCancel}
        onConfirm={handlePrimaryConfirm}
        fileName={uploadedFile?.fileName}
      />
    </Box>
  );
};

export default FileUpload;