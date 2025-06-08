import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import { 
  seedDatabase, 
  testDatabaseRelationships, 
  cleanupTestData 
} from '../api/seedDatabase';

export default function DatabaseTester() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);

  const handleSeedDatabase = async () => {
    setLoading(true);
    setMessage(null);
    setStats(null);

    try {
      const result = await seedDatabase();
      setStats(result);
      setMessage({ type: 'success', text: 'Database seeded successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to seed database: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRelationships = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await testDatabaseRelationships();
      setMessage({ 
        type: 'success', 
        text: 'All relationship tests passed! Check console for details.' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Relationship test failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Are you sure you want to delete all test data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setStats(null);

    try {
      await cleanupTestData();
      setMessage({ type: 'success', text: 'Test data cleaned up successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Cleanup failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Database Test Suite
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Use these tools to test your database setup. Make sure you're signed in first!
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={3}>
          {/* Seed Database Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Seed Database
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Populate your database with sample companies, candidates, jobs, and applications.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSeedDatabase}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Seed Database with Test Data
            </Button>
          </Box>

          {/* Test Relationships Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Test Relationships
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Verify that all foreign keys and relationships are working correctly.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTestRelationships}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Test Database Relationships
            </Button>
          </Box>

          {/* Cleanup Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              3. Cleanup Test Data
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Remove all test data from your database. Use with caution!
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCleanup}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Delete All Test Data
            </Button>
          </Box>
        </Stack>

        {/* Results Section */}
        {message && (
          <Alert severity={message.type} sx={{ mt: 3 }}>
            {message.text}
          </Alert>
        )}

        {/* Statistics Display */}
        {stats && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seeded Data Summary:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip label={`${stats.companies} Companies`} color="primary" />
              <Chip label={`${stats.contacts} Contacts`} color="primary" />
              <Chip label={`${stats.jobs} Jobs`} color="primary" />
              <Chip label={`${stats.candidates} Candidates`} color="primary" />
              <Chip label={`${stats.applications} Applications`} color="primary" />
              <Chip label={`${stats.interviews} Interviews`} color="primary" />
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}