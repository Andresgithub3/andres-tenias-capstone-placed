import { Box, Typography, Alert } from '@mui/material';

const ResumeViewer = ({ documentUrl, fileName, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Loading resume...</Typography>
      </Box>
    );
  }

  if (!documentUrl) {
    return (
      <Alert severity="info">
        No primary resume uploaded yet.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Resume Preview: {fileName}
      </Typography>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          height: 600
        }}
      >
        <iframe 
          src={documentUrl} 
          width="100%" 
          height="100%"
          style={{ border: 'none' }}
          title={`Resume: ${fileName}`}
        />
      </Box>
    </Box>
  );
};

export default ResumeViewer;