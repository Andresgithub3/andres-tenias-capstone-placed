import { Box, Typography, Alert, Button, Paper, Chip } from "@mui/material";
import {
  Download as DownloadIcon,
  Description as DocIcon,
} from "@mui/icons-material";

const ResumeViewer = ({
  documentUrl,
  fileName,
  loading = false,
  onDownload,
}) => {
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Loading resume...</Typography>
      </Box>
    );
  }

  if (!documentUrl || !fileName) {
    return <Alert severity="info">No primary resume uploaded yet.</Alert>;
  }

  // Check if file is a PDF (can be displayed inline)
  const isPDF = fileName.toLowerCase().endsWith(".pdf");
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  // If it's not a PDF, show a download card instead of trying to display inline
  if (!isPDF) {
    return (
      <Box sx={{ width: "100%", height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Primary Resume: {fileName}
        </Typography>

        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderStyle: "dashed",
            bgcolor: "action.hover",
            height: "calc(100% - 40px)", // Account for title height
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DocIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />

          <Typography variant="h6" gutterBottom>
            {fileName}
          </Typography>

          <Chip
            label={fileExtension?.toUpperCase() || "Document"}
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This file type cannot be previewed inline. Click download to view
            the document.
          </Typography>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload?.(documentUrl, fileName)}
            size="large"
          >
            Download Resume
          </Button>
        </Paper>
      </Box>
    );
  }

  // For PDFs, display inline
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
        Resume Preview: {fileName}
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
          minHeight: 0, 
        }}
      >
        <iframe
          src={documentUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title={`Resume: ${fileName}`}
        />
      </Box>
    </Box>
  );
};

export default ResumeViewer;
