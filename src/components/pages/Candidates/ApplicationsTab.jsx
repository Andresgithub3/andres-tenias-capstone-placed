import React from "react";
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
} from "@mui/material";
import { Visibility as ViewIcon, Edit as EditIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const ApplicationsTab = ({ candidate }) => {
  const navigate = useNavigate();
  const applications = candidate.applications || [];

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

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleUpdateStatus = (applicationId) => {
    // TODO: Open status update dialog
    console.log("Update status for application:", applicationId);
  };

  if (applications.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Job Applications
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          This candidate hasn't been associated with any jobs yet.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            // Trigger the job association dialog from parent
            // We'll need to pass this up as a prop
          }}
        >
          Associate with Job
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
          Job Applications ({applications.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            // Trigger job association dialog
            // We'll pass this as a prop from CandidateDetail
          }}
        >
          Add More Jobs
        </Button>
      </Box>

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id} hover>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => handleViewJob(application.job?.id)}
                    sx={{
                      textTransform: "none",
                      justifyContent: "flex-start",
                      p: 0,
                      minWidth: "auto",
                    }}
                  >
                    <Typography variant="subtitle2" color="primary">
                      {application.job?.title || "Unknown Job"}
                    </Typography>
                  </Button>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {application.job?.company?.name || "Unknown Company"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={formatStatus(application.status)}
                    color={getStatusColor(application.status)}
                    size="small"
                  />
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
                    onClick={() => handleViewJob(application.job?.id)}
                    title="View Job"
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateStatus(application.id)}
                    title="Update Status"
                  >
                    <EditIcon fontSize="small" />
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

export default ApplicationsTab;
