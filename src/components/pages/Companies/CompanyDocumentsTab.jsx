import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { storageService } from "../../../services/storageService";
import { supabase } from "../../../api/client/supabase";

const DOCUMENT_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "agreement", label: "Agreement" },
  { value: "proposal", label: "Proposal" },
  { value: "invoice", label: "Invoice" },
  { value: "presentation", label: "Presentation" },
  { value: "other", label: "Other" },
];

const CompanyDocumentsTab = ({ company, onCompanyChange }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, [company.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Get documents from database directly since storageService doesn't have getDocuments
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("entity_type", "company")
        .eq("entity_id", company.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");

      // Use the existing uploadFile function with correct parameters
      const result = await storageService.uploadFile(
        selectedFile,
        "company",
        company.id,
        documentType,
        (progress) => setUploadProgress(progress)
      );

      await loadDocuments();
      onCompanyChange(); // Refresh parent data
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentType("other");
      setUploadProgress(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const downloadUrl = await storageService.getDownloadUrl(
        document.file_path,
        true
      );

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await storageService.deleteDocument(document.id);
        await loadDocuments();
        onCompanyChange(); // Refresh parent data
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setDocumentType("other");
    setUploadProgress(0);
    setError("");
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) {
      return <PdfIcon color="error" />;
    } else if (fileType?.includes("image")) {
      return <ImageIcon color="primary" />;
    } else {
      return <FileIcon color="action" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case "contract":
        return "error";
      case "agreement":
        return "warning";
      case "proposal":
        return "info";
      case "invoice":
        return "success";
      case "presentation":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Company Documents ({documents.length})
        </Typography>
        <Button variant="contained" component="label" startIcon={<AddIcon />}>
          Upload Document
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Documents Table */}
      {documents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <DocumentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No documents uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Upload contracts, agreements, and other company-related documents.
          </Typography>
          <Button variant="contained" component="label" startIcon={<AddIcon />}>
            Upload First Document
            <input
              type="file"
              hidden
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getFileIcon(document.mime_type)}
                      <Box>
                        <Typography variant="subtitle2">
                          {document.file_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.mime_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        DOCUMENT_TYPES.find(
                          (type) => type.value === document.document_type
                        )?.label || document.document_type
                      }
                      color={getDocumentTypeColor(document.document_type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatFileSize(document.file_size_bytes)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(document.created_at), "MMM d, yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDownload(document)}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(document)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {selectedFile && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected File
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            )}

            <TextField
              select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              fullWidth
              required
            >
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            {uploading && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {uploadProgress.toFixed(0)}%
                </Typography>
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyDocumentsTab;
