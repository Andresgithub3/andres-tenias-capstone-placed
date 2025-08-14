import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { organizationService } from "../../../services/organizationService";
import { useAuth } from "../../../contexts/AuthContext";

const InvitationAcceptance = () => {
  const { invitationCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (invitationCode) {
      loadInvitation();
    }
  }, [invitationCode]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await organizationService.getInvitationByCode(
        invitationCode
      );
      setInvitation(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Redirect to login with invitation code
      navigate(`/login?invitation=${invitationCode}`);
      return;
    }

    try {
      setAccepting(true);
      setError("");

      await organizationService.acceptInvitation(invitationCode);
      setSuccess(true);

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading invitation...
        </Typography>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />
            <Typography variant="h4" gutterBottom color="success.main">
              Welcome to the team!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You have successfully joined{" "}
              <strong>{invitation?.organization?.name}</strong>. You'll be
              redirected to the dashboard shortly.
            </Typography>
            <CircularProgress size={30} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !invitation) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <ErrorIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error.main">
              Invalid Invitation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error ||
                "This invitation link is invalid, expired, or has already been used."}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 3,
        bgcolor: "grey.50",
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              You're Invited!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join your team on the recruitment platform
            </Typography>
          </Box>

          {/* Invitation Details */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
            <Typography variant="h6" gutterBottom>
              Invitation Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Organization
              </Typography>
              <Typography variant="h6">
                {invitation.organization.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Invited Email
              </Typography>
              <Typography variant="body1">{invitation.email}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Invitation Expires
              </Typography>
              <Typography variant="body1">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>

          {/* Current User Check */}
          {user && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You are currently logged in as <strong>{user.email}</strong>.
              {user.email !== invitation.email && (
                <span>
                  {" "}
                  This invitation is for <strong>{invitation.email}</strong>.
                  Please log in with the correct account to accept this
                  invitation.
                </span>
              )}
            </Alert>
          )}

          {!user && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              You need to be logged in to accept this invitation. You'll be
              redirected to log in.
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={handleDecline}
              disabled={accepting}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              onClick={handleAcceptInvitation}
              disabled={accepting || (user && user.email !== invitation.email)}
              startIcon={accepting ? <CircularProgress size={20} /> : null}
            >
              {!user
                ? "Login & Accept"
                : accepting
                ? "Joining..."
                : "Accept Invitation"}
            </Button>
          </Box>

          {/* Additional Info */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              By accepting this invitation, you'll be able to collaborate with
              your team on managing candidates, jobs, and client relationships.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvitationAcceptance;
