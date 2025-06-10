import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { applicationService } from "../../../services/applicationService";

const AssociatedCandidatesTab = ({ job, onRefresh }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (job?.id) {
      loadCandidates();
    }
  }, [job?.id]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getForJob(job.id);
      setApplications(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "associated":
        return "info";
      case "submitted-to-client":
        return "warning";
      case "interview":
        return "secondary";
      case "placed":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleViewCandidate = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await applicationService.updateStatus(applicationId, newStatus);

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // Refresh parent if needed
      onRefresh?.();
    } catch (err) {
      setError("Failed to update status: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssociateCandidate = () => {
    // TODO: Open candidate association dialog
    console.log("Associate new candidate with job");
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
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (applications.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Associated Candidates
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          No candidates have been associated with this job yet.
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAssociateCandidate}
        >
          Associate Candidates
        </Button>
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
          Associated Candidates ({applications.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={handleAssociateCandidate}
        >
          Associate More
        </Button>
      </Box>

      {/* Candidates Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Pipeline Status</TableCell>
              <TableCell>Date Associated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id} hover>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() =>
                      handleViewCandidate(application.candidate?.id)
                    }
                    sx={{
                      textTransform: "none",
                      justifyContent: "flex-start",
                      p: 0,
                      minWidth: "auto",
                    }}
                  >
                    <Typography variant="subtitle2" color="primary">
                      {application.candidate?.first_name}{" "}
                      {application.candidate?.last_name}
                    </Typography>
                  </Button>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {application.candidate?.email}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {application.candidate?.phone || "N/A"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <FormControl
                    size="small"
                    disabled={updatingStatus === application.id}
                  >
                    <Select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(application.id, e.target.value)
                      }
                      displayEmpty
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="associated">Associated</MenuItem>
                      <MenuItem value="submitted-to-client">
                        Submitted to Client
                      </MenuItem>
                      <MenuItem value="interview">Interview</MenuItem>
                      <MenuItem value="placed">Placed</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {application.applied_date
                      ? format(
                          new Date(application.applied_date),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleViewCandidate(application.candidate?.id)
                    }
                    title="View Candidate"
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssociatedCandidatesTab;
