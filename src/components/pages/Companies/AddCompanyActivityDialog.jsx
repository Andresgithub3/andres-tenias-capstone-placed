import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { activityService } from "../../../services/activityService";

const ACTIVITY_TYPES = [
  { value: "call", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
];

const AddCompanyActivityDialog = ({
  open,
  onClose,
  companyId,
  contacts,
  onActivityAdded,
}) => {
  const [formData, setFormData] = useState({
    activity_type: "",
    subject: "",
    description: "",
    scheduled_date: new Date().toISOString().slice(0, 16), // Format for datetime-local
    is_important: false,
    completed: false,
    contact_id: "", // New field for company activities
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.activity_type || !formData.subject) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const activityData = {
        entity_type: "company",
        entity_id: companyId,
        activity_type: formData.activity_type,
        subject: formData.subject,
        description: formData.description,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        is_important: formData.is_important,
        completed: formData.completed,
        contact_id: formData.contact_id || null, // Include contact if selected
      };

      const newActivity = await activityService.createActivity(activityData);

      // Reset form
      setFormData({
        activity_type: "",
        subject: "",
        description: "",
        scheduled_date: new Date().toISOString().slice(0, 16),
        is_important: false,
        completed: false,
        contact_id: "",
      });

      // Notify parent and close
      onActivityAdded(newActivity);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form and close
    setFormData({
      activity_type: "",
      subject: "",
      description: "",
      scheduled_date: new Date().toISOString().slice(0, 16),
      is_important: false,
      completed: false,
      contact_id: "",
    });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Company Activity</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Activity Type */}
          <FormControl required>
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={formData.activity_type}
              label="Activity Type"
              onChange={handleInputChange("activity_type")}
            >
              {ACTIVITY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subject */}
          <TextField
            required
            label="Subject"
            value={formData.subject}
            onChange={handleInputChange("subject")}
            placeholder="Brief description of the activity"
            fullWidth
          />

          {/* Contact Selection */}
          <FormControl>
            <InputLabel>Contact (Optional)</InputLabel>
            <Select
              value={formData.contact_id}
              label="Contact (Optional)"
              onChange={handleInputChange("contact_id")}
            >
              <MenuItem value="">
                <em>No specific contact</em>
              </MenuItem>
              {contacts.map((contact) => (
                <MenuItem key={contact.id} value={contact.id}>
                  {contact.name}
                  {contact.title && ` - ${contact.title}`}
                  {contact.is_primary && " (Primary)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Scheduled Date */}
          <TextField
            label="Scheduled Date & Time"
            type="datetime-local"
            value={formData.scheduled_date}
            onChange={handleInputChange("scheduled_date")}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Description */}
          <TextField
            label="Details"
            value={formData.description}
            onChange={handleInputChange("description")}
            placeholder="Additional details about this activity..."
            multiline
            rows={4}
            fullWidth
          />

          {/* Switches */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_important}
                  onChange={handleSwitchChange("is_important")}
                />
              }
              label="Mark as important"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.completed}
                  onChange={handleSwitchChange("completed")}
                />
              }
              label="Mark as completed"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Adding..." : "Add Activity"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCompanyActivityDialog;
