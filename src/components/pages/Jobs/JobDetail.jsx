import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  ArrowDropDown as ArrowDropDownIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
} from "@mui/icons-material";
import { jobService } from "../../../services/jobService";
import JobOverviewTab from "./JobOverviewTab";
import AssociatedCandidatesTab from "./AssociatedCandidatesTab";
import JobActivityTab from "./JobActivityTab";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [actionsAnchor, setActionsAnchor] = useState(null);

  // Load job data
  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getById(id);
      setJob(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshJob = async () => {
    try {
      const data = await jobService.getById(id);
      setJob(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle actions menu
  const handleActionsClick = (event) => {
    setActionsAnchor(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActionsAnchor(null);
  };

  const handleEditJob = () => {
    handleActionsClose();
    navigate(`/jobs/${id}/edit`);
  };

  const handleChangeStatus = () => {
    handleActionsClose();
    // TODO: Open status change dialog
    console.log("Change status clicked");
  };

  const handleAssociateCandidate = () => {
    handleActionsClose();
    // TODO: Open candidate association dialog
    console.log("Associate candidate clicked");
  };

  const handleDeleteJob = () => {
    handleActionsClose();
    // TODO: Implement delete with confirmation
    console.log("Delete job clicked");
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get status color for job status
  const getJobStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "default";
      case "active":
        return "success";
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

  // Format salary display
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;

    const currency = job.salary_currency || "CAD";
    const min = job.salary_min
      ? `${currency} ${job.salary_min.toLocaleString()}`
      : "";
    const max = job.salary_max
      ? `${currency} ${job.salary_max.toLocaleString()}`
      : "";

    if (min && max) return `${min} - ${max}`;
    if (min) return `From ${min}`;
    if (max) return `Up to ${max}`;
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Job not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Job Title and Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            {job.title}
          </Typography>

          <Button
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleActionsClick}
          >
            Actions
          </Button>

          <Menu
            anchorEl={actionsAnchor}
            open={Boolean(actionsAnchor)}
            onClose={handleActionsClose}
          >
            <MenuItem onClick={handleEditJob}>Edit Job</MenuItem>
            <MenuItem onClick={handleChangeStatus}>Change Status</MenuItem>
            <MenuItem onClick={handleAssociateCandidate}>
              Associate Candidate
            </MenuItem>
            <MenuItem onClick={handleDeleteJob}>Delete Job</MenuItem>
          </Menu>
        </Box>

        {/* Job Information */}
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body1">{job.company?.name}</Typography>
          </Box>

          {(job.location_city || job.location_state) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body1">
                {[job.location_city, job.location_state]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Box>
          )}

          {formatSalary() && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SalaryIcon fontSize="small" color="action" />
              <Typography variant="body1">{formatSalary()}</Typography>
            </Box>
          )}
        </Box>

        {/* Job Status and Meta */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={job.status?.toUpperCase()}
            color={getJobStatusColor(job.status)}
            size="medium"
          />

          {job.employment_type && (
            <Chip label={job.employment_type} variant="outlined" size="small" />
          )}

          {job.experience_level && (
            <Chip
              label={`${job.experience_level} Level`}
              variant="outlined"
              size="small"
            />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            Posted:{" "}
            {job.created_at
              ? new Date(job.created_at).toLocaleDateString()
              : "N/A"}
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Associated Candidates" />
          <Tab label="Activity" />
          <Tab label="Documents" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && <JobOverviewTab job={job} />}
        {activeTab === 1 && (
          <AssociatedCandidatesTab job={job} onRefresh={refreshJob} />
        )}
        {activeTab === 2 && (
          <JobActivityTab job={job} />
        )}
        {activeTab === 3 && (
          <Typography>Job Documents content will go here</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default JobDetail;
