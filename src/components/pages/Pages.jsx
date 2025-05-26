// Jobs.jsx
import React from 'react';
import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';

export const Jobs = () => (
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

// Candidates.jsx
import { People as PeopleIcon } from '@mui/icons-material';

export const Candidates = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Candidates Pipeline
    </Typography>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <PeopleIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Candidate Management Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track candidates through your recruitment process. Manage profiles, resumes, and interview feedback.
        </Typography>
        <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
          Add Your First Candidate
        </Button>
      </CardContent>
    </Card>
  </Box>
);

// Interviews.jsx
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

export const Interviews = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Interview Scheduling
    </Typography>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <CalendarIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Interview Management Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Schedule interviews, manage calendars, and collect feedback from interview panels.
        </Typography>
        <Button variant="contained" color="success" sx={{ mt: 2 }}>
          Schedule Your First Interview
        </Button>
      </CardContent>
    </Card>
  </Box>
);

// Companies.jsx
import { Business as BusinessIcon } from '@mui/icons-material';

export const Companies = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Company Management
    </Typography>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <BusinessIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Company Management Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage client companies, contacts, and track recruitment projects for each organization.
        </Typography>
        <Button variant="contained" color="warning" sx={{ mt: 2 }}>
          Add Your First Company
        </Button>
      </CardContent>
    </Card>
  </Box>
);

// Analytics.jsx
import { Analytics as AnalyticsIcon } from '@mui/icons-material';

export const Analytics = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Analytics & Reports
    </Typography>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <AnalyticsIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Analytics Dashboard Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Get insights into your recruitment metrics, track performance, and generate detailed reports.
        </Typography>
        <Button variant="contained" color="info" sx={{ mt: 2 }}>
          View Sample Report
        </Button>
      </CardContent>
    </Card>
  </Box>
);