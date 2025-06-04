import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      setEmail('');
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" color="primary" gutterBottom>
                Placed
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Reset your password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Box>

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent! Please check your inbox and follow the instructions.
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Reset Password Form */}
            <Box component="form" onSubmit={handleResetPassword}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Sending reset email...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Back to Login */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                variant="text"
                color="primary"
              >
                Back to Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;