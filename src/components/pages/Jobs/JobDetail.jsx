import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';

export const JobDetail = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Jobs Management
    </Typography>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <WorkIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Job Management Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create, edit, and manage job postings. Track applications and manage the recruitment pipeline.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Create Your First Job
        </Button>
      </CardContent>
    </Card>
  </Box>
);