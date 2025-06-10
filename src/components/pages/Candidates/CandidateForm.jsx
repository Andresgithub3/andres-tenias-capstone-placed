import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import { candidateService } from "../../../services/candidateService";

const CandidateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = id && id !== "new";

  //Form hook setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      linkedin_url: "",
      current_title: "",
      current_company: "",
      skills: "",
      location_city: "",
      salary_expectation_min: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      // Only include fields that exist in the candidates table
      const processedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        linkedin_url: data.linkedin_url || null,
        current_title: data.current_title || null,
        current_company: data.current_company || null,
        location_city: data.location_city || null,
        salary_expectation_min: data.salary_expectation_min || null,
        skills: data.skills
          ? data.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
      };

      console.log("Data being sent:", processedData); // Debug log

      let result;
      if (isEditing) {
        result = await candidateService.update(id, processedData);
      } else {
        result = await candidateService.create(processedData);
      }

      navigate(`/candidates/${result.id}`);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      loadCandidate();
    }
  }, [id, isEditing]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      console.log("Loading candidate with ID:", id); // Debug log
      const candidateData = await candidateService.getById(id);
      console.log("Loaded candidate data:", candidateData); // Debug log

      // Extract ONLY the candidate fields, not the related data
      const formData = {
        first_name: candidateData.first_name || "",
        last_name: candidateData.last_name || "",
        email: candidateData.email || "",
        phone: candidateData.phone || "",
        linkedin_url: candidateData.linkedin_url || "",
        current_title: candidateData.current_title || "",
        current_company: candidateData.current_company || "",
        skills: candidateData.skills ? candidateData.skills.join(", ") : "",
        location_city: candidateData.location_city || "",
        salary_expectation_min: candidateData.salary_expectation_min
          ? candidateData.salary_expectation_min.toString()
          : "",
      };

      console.log("Form data to reset with:", formData); // Debug log
      reset(formData);
      setError("");
    } catch (err) {
      console.error("Error loading candidate:", err); // Debug log
      setError(`Failed to load candidate: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Candidate" : "Add New Candidate"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the candidate details below. Required fields are marked with *
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Left Column - Basic Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name *"
                      margin="normal"
                      required
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
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
                      fullWidth
                      label="Last Name *"
                      margin="normal"
                      required
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Box>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email *"
                    type="email"
                    margin="normal"
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone *"
                    margin="normal"
                    required
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />

              <Controller
                name="linkedin_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="LinkedIn URL"
                    margin="normal"
                    placeholder="https://linkedin.com/in/username"
                  />
                )}
              />

              <Controller
                name="current_title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Title"
                    margin="normal"
                    placeholder="e.g. Senior Software Engineer"
                  />
                )}
              />

              <Controller
                name="current_company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Company"
                    margin="normal"
                    placeholder="e.g. Tech Corp Inc."
                  />
                )}
              />
            </Grid>

            {/* Right Column - Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>

              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Skills"
                    margin="normal"
                    placeholder="JavaScript, React, Node.js, SQL (comma separated)"
                    helperText="Enter skills separated by commas"
                  />
                )}
              />

              <Controller
                name="location_city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Location"
                    margin="normal"
                    placeholder="City"
                  />
                )}
              />

              <Controller
                name="salary_expectation_min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Salary Expectation"
                    margin="normal"
                    placeholder="e.g. 80000"
                    helperText="Enter expected salary range"
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/candidates")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Candidate"
                : "Add Candidate"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CandidateForm;
