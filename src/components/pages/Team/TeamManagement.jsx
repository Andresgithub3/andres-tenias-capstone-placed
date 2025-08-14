import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { organizationService } from "../../../services/organizationService";

const TeamManagement = () => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, membersData, invitationsData] = await Promise.all([
        organizationService.getCurrentOrganization(),
        organizationService.getOrganizationMembers(),
        organizationService.getPendingInvitations(),
      ]);

      setOrganization(orgData);
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInviteSubmit = async (data) => {
    try {
      await organizationService.createInvitation(data.email);
      showSnackbar("Invitation sent successfully!");
      setInviteDialogOpen(false);
      reset();
      loadData(); // Refresh invitations list
    } catch (error) {
      showSnackbar(error.message, "error");
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await organizationService.cancelInvitation(invitationId);
      showSnackbar("Invitation cancelled");
      loadData();
    } catch (error) {
      showSnackbar(error.message, "error");
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await organizationService.removeMember(selectedMember.user.id);
      showSnackbar("Member removed from organization");
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      loadData();
    } catch (error) {
      showSnackbar(error.message, "error");
    }
  };

  const copyInvitationLink = (invitationCode) => {
    const inviteUrl = `${window.location.origin}/invite/${invitationCode}`;
    navigator.clipboard.writeText(inviteUrl);
    showSnackbar("Invitation link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization members and send invitations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Organization Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Organization</Typography>
              </Box>
              <Typography variant="h5" gutterBottom>
                {organization?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created:{" "}
                {organization?.created_at
                  ? formatDate(organization.created_at)
                  : "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <PeopleIcon
                    sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                  />
                  <Typography variant="h4">{members.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <PendingIcon
                    sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
                  />
                  <Typography variant="h4">{invitations.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Invitations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Team Members */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Team Members</Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Invite Member
              </Button>
            </Box>

            <List>
              {members.map((member, index) => (
                <React.Fragment key={member.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {member.user.email.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.user.email}
                      secondary={`Joined: ${formatDate(member.joined_at)}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove member">
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSelectedMember(member);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < members.length - 1 && <Divider />}
                </React.Fragment>
              ))}

              {members.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No team members"
                    secondary="Invite your first team member to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Pending Invitations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Invitations
            </Typography>

            <List>
              {invitations.map((invitation, index) => (
                <React.Fragment key={invitation.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "warning.main" }}>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={invitation.email}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Sent: {formatDate(invitation.created_at)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Expires: {formatDate(invitation.expires_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Copy invitation link">
                          <IconButton
                            size="small"
                            onClick={() =>
                              copyInvitationLink(invitation.invitation_code)
                            }
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel invitation">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < invitations.length - 1 && <Divider />}
                </React.Fragment>
              ))}

              {invitations.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No pending invitations"
                    secondary="All invitations have been accepted or expired"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  placeholder="colleague@company.com"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(handleInviteSubmit)}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{" "}
            <strong>{selectedMember?.user.email}</strong> from the organization?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveMember}
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamManagement;
