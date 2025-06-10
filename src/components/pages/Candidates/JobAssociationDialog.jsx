import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { jobService } from "../../../services/jobService";
import { applicationService } from "../../../services/applicationService";

const JobAssociationDialog = ({ open, onClose, candidate, onSuccess }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && candidate) {
      loadAvailableJobs();
    }
  }, [open, candidate]);

  useEffect(() => {
    // Filter jobs based on search term
    if (searchTerm) {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [jobs, searchTerm]);

  const loadAvailableJobs = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all active jobs
      const allJobs = await jobService.getActiveJobs();

      // Get candidate's existing applications to filter out
      const existingApplications = candidate.applications || [];
      const existingJobIds = existingApplications.map((app) => app.job_id);

      // Filter out jobs the candidate is already associated with
      const availableJobs = allJobs.filter(
        (job) => !existingJobIds.includes(job.id)
      );

      setJobs(availableJobs);
    } catch (err) {
      setError("Failed to load jobs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobToggle = (jobId) => {
    setSelectedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const handleAssociate = async () => {
    if (selectedJobIds.length === 0) {
      setError("Please select at least one job to associate");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Create applications for each selected job
      const applicationPromises = selectedJobIds.map((jobId) =>
        applicationService.create({
          candidate_id: candidate.id,
          job_id: jobId,
        })
      );

      await Promise.all(applicationPromises);

      // Show success and refresh
      onSuccess(
        `Successfully associated ${candidate.first_name} with ${selectedJobIds.length} job(s)`
      );
      handleClose();
    } catch (err) {
      setError("Failed to create associations: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedJobIds([]);
    setSearchTerm("");
    setError("");
    onClose();
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Associate {candidate.first_name} {candidate.last_name} with Jobs
      </DialogTitle>

      <DialogContent>
        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Selected Count */}
            {selectedJobIds.length > 0 && (
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                {selectedJobIds.length} job(s) selected
              </Typography>
            )}

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm
                    ? "No jobs found matching your search"
                    : "No available jobs to associate"}
                </Typography>
                {!searchTerm && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    The candidate may already be associated with all active jobs
                  </Typography>
                )}
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {filteredJobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <ListItem sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedJobIds.includes(job.id)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleJobToggle(job.id);
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent ListItem click
                        />
                      </ListItemIcon>
                      <ListItemText
                        onClick={() => handleJobToggle(job.id)} // Keep text clickable
                        sx={{ cursor: "pointer" }}
                        primary={job.title}
                        secondary={
                          <>
                            {job.company?.name}
                            {job.location_city && (
                              <Box
                                component="span"
                                sx={{ display: "block", fontSize: "0.75rem" }}
                              >
                                {job.location_city}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < filteredJobs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleAssociate}
          variant="contained"
          disabled={submitting || selectedJobIds.length === 0}
        >
          {submitting
            ? "Associating..."
            : `Associate (${selectedJobIds.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobAssociationDialog;
