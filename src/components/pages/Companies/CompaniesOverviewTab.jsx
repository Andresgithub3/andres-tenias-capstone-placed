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
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { companyContactService } from "../../../services/companyContactService";

const CompanyOverviewTab = ({ company, onCompanyChange }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      department: "",
      notes: "",
      is_primary: false,
    },
  });

  useEffect(() => {
    loadContacts();
  }, [company.id]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await companyContactService.getByCompany(company.id);
      setContacts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    reset({
      first_name: "",
      last_name: "",
      title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      department: "",
      notes: "",
      is_primary: false,
    });
    setDialogOpen(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    reset(contact);
    setDialogOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (confirmed) {
      try {
        await companyContactService.delete(contactId);
        await loadContacts();
        onCompanyChange(); // Refresh parent data
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      // Clean up LinkedIn URL
      if (data.linkedin_url && !data.linkedin_url.startsWith("http")) {
        data.linkedin_url = "https://" + data.linkedin_url;
      }

      const contactData = {
        ...data,
        company_id: company.id,
      };

      if (editingContact) {
        await companyContactService.update(editingContact.id, contactData);
      } else {
        await companyContactService.create(contactData);
      }

      await loadContacts();
      onCompanyChange(); // Refresh parent data
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingContact(null);
    setError("");
  };

  const primaryContact = contacts.find((contact) => contact.is_primary);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Company Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Company Information</Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {company.address && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {company.address}
                      {company.city && (
                        <>
                          <br />
                          {[company.city, company.state, company.postal_code]
                            .filter(Boolean)
                            .join(", ")}
                        </>
                      )}
                      {company.country && (
                        <>
                          <br />
                          {company.country}
                        </>
                      )}
                    </Typography>
                  </Box>
                )}

                {company.website && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Website
                    </Typography>
                    <Typography
                      variant="body1"
                      component="a"
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none", color: "primary.main" }}
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </Typography>
                  </Box>
                )}

                {company.linkedin_url && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      LinkedIn
                    </Typography>
                    <Typography
                      variant="body1"
                      component="a"
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none", color: "primary.main" }}
                    >
                      Company LinkedIn
                    </Typography>
                  </Box>
                )}

                {company.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {company.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Primary Contact Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Primary Contact</Typography>
              </Box>

              {primaryContact ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {primaryContact.first_name} {primaryContact.last_name}
                    </Typography>
                    {primaryContact.title && (
                      <Typography variant="body2" color="text.secondary">
                        {primaryContact.title}
                      </Typography>
                    )}
                    {primaryContact.department && (
                      <Chip
                        label={primaryContact.department}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>

                  {primaryContact.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        component="a"
                        href={`mailto:${primaryContact.email}`}
                        sx={{ textDecoration: "none", color: "primary.main" }}
                      >
                        {primaryContact.email}
                      </Typography>
                    </Box>
                  )}

                  {primaryContact.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        component="a"
                        href={`tel:${primaryContact.phone}`}
                        sx={{ textDecoration: "none", color: "primary.main" }}
                      >
                        {primaryContact.phone}
                      </Typography>
                    </Box>
                  )}

                  {primaryContact.linkedin_url && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinkedInIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        component="a"
                        href={primaryContact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textDecoration: "none", color: "primary.main" }}
                      >
                        LinkedIn Profile
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No primary contact assigned. Add contacts below and mark one
                  as primary.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* All Contacts Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  All Contacts ({contacts.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddContact}
                  size="small"
                >
                  Add Contact
                </Button>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : contacts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <PersonIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    No contacts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Add contacts to track your relationships at this company.
                  </Typography>
                  <Button variant="outlined" onClick={handleAddContact}>
                    Add First Contact
                  </Button>
                </Box>
              ) : (
                <List>
                  {contacts.map((contact, index) => (
                    <React.Fragment key={contact.id}>
                      <ListItem
                        sx={{ px: 0 }}
                        secondaryAction={
                          <Box>
                            <IconButton
                              edge="end"
                              onClick={() => handleEditContact(contact)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteContact(contact.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={`${contact.first_name}${contact.last_name}${
                            contact.is_primary ? " (Primary)" : ""
                          }`}
                          secondary={[
                            contact.title && contact.department
                              ? `${contact.title} • ${contact.department}`
                              : contact.title || contact.department,
                            contact.email,
                            contact.phone,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        />
                        {contact.is_primary && (
                          <Chip
                            icon={<StarIcon />}
                            label="Primary"
                            size="small"
                            color="warning"
                            sx={{ ml: 1, mr: 2 }}
                          />
                        )}
                      </ListItem>
                      {index < contacts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingContact ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <Controller
                name="first_name"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="last_name"
                control={control}
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Job Title" fullWidth />
                )}
              />

              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Department" fullWidth />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Phone" fullWidth />
                )}
              />

              <Controller
                name="linkedin_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="LinkedIn URL"
                    fullWidth
                    placeholder="linkedin.com/in/contact-name"
                  />
                )}
              />

              <Controller
                name="is_primary"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Contact Type" fullWidth>
                    <MenuItem value={false}>Regular Contact</MenuItem>
                    <MenuItem value={true}>Primary Contact</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Additional notes about this contact..."
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingContact
                ? "Update Contact"
                : "Add Contact"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CompanyOverviewTab;
