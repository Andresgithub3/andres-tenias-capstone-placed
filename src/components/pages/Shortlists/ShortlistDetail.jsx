import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  EventNote as EventNoteIcon,
} from "@mui/icons-material";
import { shortlistService } from "../../../services/shortlistService";
import { jobService } from "../../../services/jobService";
import { applicationService } from "../../../services/applicationService";

const ShortlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shortlist, setShortlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [jobAssociationOpen, setJobAssociationOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");

  useEffect(() => {
    loadShortlistData();
    loadJobs();
  }, [id]);

  const loadShortlistData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await shortlistService.getById(id);
      setShortlist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await jobService.getAll();
      setJobs(jobsData.filter((job) => job.status === "active"));
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  const handleMenuOpen = (event, candidate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCandidate(candidate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCandidate(null);
  };

  const handleRemoveCandidate = async () => {
    if (!selectedCandidate) return;

    if (
      window.confirm(
        `Remove ${selectedCandidate.candidate.first_name} ${selectedCandidate.candidate.last_name} from this shortlist?`
      )
    ) {
      try {
        await shortlistService.removeCandidate(
          id,
          selectedCandidate.candidate_id
        );
        loadShortlistData();
        handleMenuClose();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEditNotes = () => {
    setCandidateNotes(selectedCandidate?.notes || "");
    setNoteDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidate) return;

    try {
      await shortlistService.updateCandidateNotes(
        id,
        selectedCandidate.candidate_id,
        candidateNotes
      );
      loadShortlistData();
      setNoteDialogOpen(false);
      setCandidateNotes("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCandidateSelect = (candidateId, checked) => {
    if (checked) {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCandidates(shortlist.candidates.map((c) => c.candidate_id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleJobAssociation = async () => {
    if (selectedCandidates.length === 0 || !selectedJob) return;

    try {
      // Associate each selected candidate with the job
      for (const candidateId of selectedCandidates) {
        const existingApplication = await applicationService.checkExisting(
          candidateId,
          selectedJob
        );
        if (!existingApplication) {
          await applicationService.create({
            candidate_id: candidateId,
            job_id: selectedJob,
          });
        }
      }

      setJobAssociationOpen(false);
      setSelectedCandidates([]);
      setSelectedJob("");
      alert(
        `Successfully associated ${selectedCandidates.length} candidates with the job.`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportCSV = () => {
    if (!shortlist?.candidates || shortlist.candidates.length === 0) return;

    const csvData = shortlist.candidates.map((item) => ({
      "First Name": item.candidate.first_name || "",
      "Last Name": item.candidate.last_name || "",
      Email: item.candidate.email || "",
      Phone: item.candidate.phone || "",
      LinkedIn: item.candidate.linkedin_url || "",
      Notes: item.notes || "",
      "Added Date": new Date(item.added_at).toLocaleDateString(),
      "Added By": item.added_by_user?.email || "",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shortlist.name.replace(/\s+/g, "_")}_candidates.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!shortlist) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Shortlist not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/shortlists");
          }}
        >
          Shortlists
        </Link>
        <Typography color="text.primary">{shortlist.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <IconButton onClick={() => navigate("/shortlists")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {shortlist.name}
            </Typography>
          </Box>
          {shortlist.description && (
            <Typography variant="body1" color="text.secondary" sx={{ ml: 6 }}>
              {shortlist.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={
              !shortlist.candidates || shortlist.candidates.length === 0
            }
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/candidates")}
          >
            Add Candidates
          </Button>
          <Button
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={() => setJobAssociationOpen(true)}
            disabled={selectedCandidates.length === 0}
          >
            Associate with Job ({selectedCandidates.length})
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary.main">
                {shortlist.candidates?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Candidates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Created by
              </Typography>
              <Typography variant="body1">
                {shortlist.created_by_user?.email || "Unknown"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDate(shortlist.created_at)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(shortlist.updated_at)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Candidates Table */}
      {!shortlist.candidates || shortlist.candidates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <PersonAddIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No candidates in this shortlist
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add candidates from your candidate list or search results
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/candidates")}
          >
            Browse Candidates
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedCandidates.length === shortlist.candidates.length
                    }
                    indeterminate={
                      selectedCandidates.length > 0 &&
                      selectedCandidates.length < shortlist.candidates.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Candidate</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Added Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortlist.candidates.map((item) => (
                <TableRow key={item.candidate_id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCandidates.includes(item.candidate_id)}
                      onChange={(e) =>
                        handleCandidateSelect(
                          item.candidate_id,
                          e.target.checked
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar>
                        {item.candidate.first_name?.charAt(0) || "?"}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {item.candidate.first_name} {item.candidate.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.candidate.title || "No title"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {item.candidate.email && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {item.candidate.email}
                          </Typography>
                        </Box>
                      )}
                      {item.candidate.phone && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {item.candidate.phone}
                          </Typography>
                        </Box>
                      )}
                      {item.candidate.linkedin_url && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinkedInIcon fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            LinkedIn Profile
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.notes ? (
                      <Chip
                        icon={<EventNoteIcon />}
                        label="Has notes"
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedCandidate(item);
                          handleEditNotes();
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No notes
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.added_by_user?.email || "Unknown"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(item.added_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, item)}>
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
        <MenuItem onClick={handleEditNotes}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Notes</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemoveCandidate} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove from Shortlist</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notes Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Candidate Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            placeholder="Add notes about this candidate..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNotes} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Association Dialog */}
      <Dialog
        open={jobAssociationOpen}
        onClose={() => setJobAssociationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Associate Candidates with Job</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Associate {selectedCandidates.length} selected candidate(s) with a
            job.
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Job"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Choose a job...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.company?.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobAssociationOpen(false)}>Cancel</Button>
          <Button
            onClick={handleJobAssociation}
            variant="contained"
            disabled={!selectedJob}
          >
            Associate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShortlistDetail;
