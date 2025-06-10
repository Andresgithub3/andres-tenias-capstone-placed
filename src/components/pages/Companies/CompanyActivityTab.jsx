import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  Collapse,
  IconButton,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as MeetingIcon,
  Note as NoteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as TimeIcon,
  Star as ImportantIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { activityService } from "../../../services/activityService";
import { companyContactService } from "../../../services/companyContactService";
import AddCompanyActivityDialog from "./AddCompanyActivityDialog";

// Activity type configurations
const ACTIVITY_TYPES = {
  call: { icon: PhoneIcon, label: "Phone Call", color: "primary" },
  email: { icon: EmailIcon, label: "Email", color: "info" },
  meeting: { icon: MeetingIcon, label: "Meeting", color: "success" },
  note: { icon: NoteIcon, label: "Note", color: "default" },
};

const CompanyActivityTab = ({ company, onCompanyChange }) => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [company.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load both activities and contacts
      const [activitiesData, contactsData] = await Promise.all([
        activityService.getByEntity("company", company.id),
        companyContactService.getByCompany(company.id),
      ]);

      setActivities(activitiesData);
      setContacts(contactsData);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activityId) => {
    setExpandedActivity((prev) => (prev === activityId ? null : activityId));
  };

  const handleAddActivity = () => {
    setAddDialogOpen(true);
  };

  const handleActivityAdded = (newActivity) => {
    // Add new activity to the beginning of the list
    setActivities((prev) => [newActivity, ...prev]);
    onCompanyChange(); // Refresh parent data
  };

  const getActivityIcon = (type) => {
    const config = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.note;
    const IconComponent = config.icon;
    return <IconComponent />;
  };

  const getActivityConfig = (type) => {
    return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.note;
  };

  const formatActivityDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const getContactName = (contactId) => {
    if (!contactId) return null;
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? contact.name : "Unknown Contact";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Add Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Company Activity Timeline ({activities.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddActivity}
        >
          Add Activity
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            No activities recorded yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Track your communications, meetings, and notes with {company.name}.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddActivity}
            sx={{ mt: 2 }}
          >
            Add First Activity
          </Button>
        </Paper>
      ) : (
        <List sx={{ width: "100%" }}>
          {activities.map((activity, index) => {
            const config = getActivityConfig(activity.activity_type);
            const isExpanded = expandedActivity === activity.id;
            const contactName = getContactName(activity.contact_id);

            return (
              <React.Fragment key={activity.id}>
                <Paper
                  sx={{
                    mb: 1,
                    transition: "all 0.2s",
                    "&:hover": { elevation: 2 },
                  }}
                  elevation={isExpanded ? 2 : 1}
                >
                  <ListItemButton
                    onClick={() => handleActivityClick(activity.id)}
                    sx={{
                      py: 2,
                      flexDirection: "column",
                      alignItems: "stretch",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <ListItemIcon>
                        {getActivityIcon(activity.activity_type)}
                      </ListItemIcon>

                      {/* Main Content */}
                      <Box sx={{ flexGrow: 1 }}>
                        {/* Title Row */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" component="span">
                            {activity.subject || "No subject"}
                          </Typography>
                          <Chip
                            label={config.label}
                            size="small"
                            color={config.color}
                            variant="outlined"
                          />
                          {activity.is_important && (
                            <Chip
                              icon={<ImportantIcon />}
                              label="Important"
                              size="small"
                              color="warning"
                            />
                          )}
                          {activity.completed && (
                            <Chip
                              label="Completed"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {/* Date and Contact Row */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatActivityDate(
                                activity.scheduled_date || activity.created_at
                              )}
                            </Typography>
                          </Box>

                          {contactName && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <PersonIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                with {contactName}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <IconButton edge="end">
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </ListItemButton>

                  {/* Expandable Content */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 3, pb: 3 }}>
                      <Divider sx={{ mb: 2 }} />

                      {/* Activity Details */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Details:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 2,
                          whiteSpace: "pre-wrap",
                          bgcolor: "action.hover",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        {activity.description || "No details provided."}
                      </Typography>

                      {/* Contact Information */}
                      {contactName && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Contact:
                          </Typography>
                          <Typography variant="body2">{contactName}</Typography>
                        </Box>
                      )}

                      {/* Created Date */}
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Created:
                        </Typography>
                        <Typography variant="body2">
                          {formatActivityDate(activity.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>

                {index < activities.length - 1 && <Box sx={{ mb: 1 }} />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* Add Activity Dialog */}
      <AddCompanyActivityDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        companyId={company.id}
        contacts={contacts}
        onActivityAdded={handleActivityAdded}
      />
    </Box>
  );
};

export default CompanyActivityTab;
