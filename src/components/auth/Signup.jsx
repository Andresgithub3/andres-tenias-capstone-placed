import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, session } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (session && user) {
      navigate('/dashboard');
    }
  }, [session, user, navigate]);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // Redirect will be handled by Supabase OAuth flow
    } catch (error) {
      setError(error.message || 'Failed to sign up with Google');
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join us and start managing your recruitment process.
              </Typography>
            </Box>

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Account created successfully! Please check your email to verify your account.
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Google Sign Up Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              sx={{
                mb: 3,
                py: 1.5,
                borderColor: '#dadce0',
                color: '#3c4043',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#dadce0',
                },
              }}
            >
              {googleLoading ? 'Creating account...' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            {/* Email/Password Form */}
            <Box component="form" onSubmit={handleEmailSignup}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading || googleLoading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || googleLoading}
                  helperText="Must be at least 6 characters"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading || googleLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || googleLoading}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        disabled={loading || googleLoading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || googleLoading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Footer Links */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'inherit',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;