import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Search, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { jobService } from "../../../services/jobService";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = searchTerm ? { search: searchTerm } : {};
      const jobsData = await jobService.getAll(filters);
      setJobs(jobsData);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    loadJobs();
  };

  const getStatusColor = (status) => {
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

  const handleRowClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleAddJob = () => {
    navigate("/jobs/new");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Jobs
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddJob}>
          Add New Job
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search jobs by title..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={handleSearchSubmit} size="small">
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Jobs Table or Empty State */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {searchTerm
                      ? "No jobs found matching your search."
                      : "No jobs found."}
                    <Button onClick={handleAddJob} sx={{ ml: 1 }}>
                      {searchTerm ? "Clear search" : "Add your first job"}
                    </Button>
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow
                  key={job.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(job.id)}
                >
                  <TableCell>
                    <Typography variant="subtitle2">{job.title}</Typography>
                  </TableCell>
                  <TableCell>{job.company?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>{job.location_city || "Remote"}</TableCell>
                  <TableCell>
                    {job.created_at
                      ? format(new Date(job.created_at), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JobsList;
