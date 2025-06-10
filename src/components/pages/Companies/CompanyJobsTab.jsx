import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { jobService } from "../../../services/jobService";

const CompanyJobsTab = ({ company, onCompanyChange }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [company.id]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Get all jobs and filter by company
      const allJobs = await jobService.getAll();
      const companyJobs = allJobs.filter(
        (job) => job.company_id === company.id
      );
      setJobs(companyJobs);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleViewJob = () => {
    navigate(`/jobs/${selectedJob.id}`);
    handleMenuClose();
  };

  const handleEditJob = () => {
    navigate(`/jobs/${selectedJob.id}/edit`);
    handleMenuClose();
  };

  const handleCreateJob = () => {
    // Navigate to job creation with company pre-selected
    navigate(`/jobs/new?company=${company.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "default";
      case "paused":
        return "warning";
      case "filled":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return "Not specified";

    const formatAmount = (amount) => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      } else {
        return `$${amount}`;
      }
    };

    if (minSalary && maxSalary) {
      return `${formatAmount(minSalary)} - ${formatAmount(maxSalary)}`;
    } else if (minSalary) {
      return `${formatAmount(minSalary)}+`;
    } else {
      return `Up to ${formatAmount(maxSalary)}`;
    }
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Jobs Posted by {company.name} ({jobs.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateJob}
        >
          Post New Job
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Jobs Table */}
      {jobs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs posted yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by posting a job for {company.name} to attract candidates.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateJob}
          >
            Post First Job
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Salary Range</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell align="center">Applications</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {job.title}
                      </Typography>
                      {job.job_type && (
                        <Typography variant="caption" color="text.secondary">
                          {job.job_type}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.location || "Remote/Not specified"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(job.created_at), "MMM d, yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={job.application_count || 0}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, job);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewJob}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditJob}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Job
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CompanyJobsTab;
