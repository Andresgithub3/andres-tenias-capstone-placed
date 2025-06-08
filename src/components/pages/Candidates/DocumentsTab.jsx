import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import { FileUpload } from "../../documents/FileUpload";
import { DocumentList } from "../../documents/DocumentList";
import { storageService } from "../../../services/storageService";

const DocumentsTab = ({ candidate, onDocumentChange }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (candidate?.documents) {
      setDocuments(candidate.documents);
      setLoading(false);
    }
  }, [candidate]);

  const handleUploadSuccess = (result) => {
    // Add the new document to the list
    setDocuments((prev) => [result.document, ...prev]);

    // Notify parent component if primary resume changed
    if (result.madePrimary || result.isFirstResume) {
      onDocumentChange?.();
    }

    setError("");
  };

  const handleUploadError = (error) => {
    setError(error.message);
  };

  const handleDownload = async (document) => {
    try {
      const url = await storageService.getDownloadUrl(document.file_path);

      // Create a temporary link to download the file
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.file_name;
      link.target = "_blank";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      setError("Failed to download file: " + error.message);
    }
  };

  const handleDelete = async (document) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${document.file_name}"?`
      )
    ) {
      return;
    }

    try {
      await storageService.deleteDocument(document.id);

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));

      // If we deleted the primary resume, notify parent
      if (document.is_primary && document.document_type === "resume") {
        onDocumentChange?.();
      }

      setError("");
    } catch (error) {
      setError("Failed to delete document: " + error.message);
    }
  };

  const handleSetPrimary = async (document) => {
    try {
      await storageService.setPrimaryDocument(
        document.id,
        candidate.id,
        document.document_type
      );

      // Update local state
      setDocuments((prev) =>
        prev.map((doc) => ({
          ...doc,
          is_primary:
            doc.id === document.id &&
            doc.document_type === document.document_type,
        }))
      );

      // Notify parent component
      onDocumentChange?.();

      setError("");
    } catch (error) {
      setError("Failed to set primary document: " + error.message);
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
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload New Document
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload resumes, portfolios, certifications, or other candidate
          documents.
        </Typography>

        <FileUpload
          entityType="candidate"
          entityId={candidate.id}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Documents List */}
      <Box>
        <Typography variant="h6" gutterBottom>
          All Documents ({documents.length})
        </Typography>

        <DocumentList
          documents={documents}
          loading={false}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onSetPrimary={handleSetPrimary}
          showPrimaryActions={true}
        />
      </Box>
    </Box>
  );
};

export default DocumentsTab;
