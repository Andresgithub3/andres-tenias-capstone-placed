import { Box, Typography } from '@mui/material';

const JobsList = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Jobs
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Jobs management will be implemented here.
      </Typography>
    </Box>
  );
};

export default JobsList;