import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jobService } from "../../../services/jobService";

const JobForm = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    company_id: "",
    status: "draft",
    employment_type: "",
    experience_level: "",
    priority: "medium",
    description: "",
    requirements: "",
    nice_to_have: "",
    skills: "",
    department: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "CAD",
    location_city: "",
    location_state: "",
    location_country: "Canada",
    positions_available: 1,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await jobService.getCompaniesForDropdown();
      setCompanies(companiesData);
    } catch (err) {
      setError("Failed to load companies: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.company_id || !formData.description) {
      setError(
        "Please fill in all required fields (Title, Company, Description)"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Process skills (convert comma-separated string to array)
      const processedData = {
        ...formData,
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        salary_min: formData.salary_min
          ? parseFloat(formData.salary_min)
          : null,
        salary_max: formData.salary_max
          ? parseFloat(formData.salary_max)
          : null,
        positions_available: parseInt(formData.positions_available) || 1,
      };

      await jobService.createJob(processedData);
      navigate("/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Job
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the job details below. Required fields are marked with *
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
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Basic Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>

              <TextField
                fullWidth
                label="Job Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                select
                label="Company *"
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                <MenuItem value="">Select a company</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="filled">Filled</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Employment Type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value="full-time">Full Time</MenuItem>
                <MenuItem value="part-time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="temporary">Temporary</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Experience Level"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="">Select level</MenuItem>
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="lead">Lead/Principal</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Grid>

            {/* Right Column - Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
                required
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              />

              <TextField
                fullWidth
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                placeholder="Required skills, experience, education, certifications..."
              />

              <TextField
                fullWidth
                label="Nice to Have"
                name="nice_to_have"
                value={formData.nice_to_have}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
                placeholder="Preferred but not required qualifications..."
              />

              <TextField
                fullWidth
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                margin="normal"
                placeholder="JavaScript, React, Node.js, SQL (comma separated)"
                helperText="Enter skills separated by commas"
              />

              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., Engineering, Marketing, Sales"
              />

              {/* Salary Row */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                  label="Salary Min"
                  name="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Salary Max"
                  name="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Location Fields */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Location
              </Typography>
              <TextField
                fullWidth
                label="City"
                name="location_city"
                value={formData.location_city}
                onChange={handleInputChange}
                margin="normal"
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="State/Province"
                  name="location_state"
                  value={formData.location_state}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Country"
                  name="location_country"
                  value={formData.location_country}
                  onChange={handleInputChange}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/jobs")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default JobForm;
