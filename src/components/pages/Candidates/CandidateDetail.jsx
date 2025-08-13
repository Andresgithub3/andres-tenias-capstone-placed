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
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowDropDown as ArrowDropDownIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { candidateService } from "../../../services/candidateService";
import OverviewTab from "./OverviewTab";
import DocumentsTab from "./DocumentsTab";
import ActivityTab from "./ActivityTab";
import JobAssociationDialog from "./JobAssociationDialog";
import ApplicationsTab from "./ApplicationsTab";
import ScheduleInterviewDialog from "../../interviews/ScheduleInterviewDialog";

// Pipeline stages
const PIPELINE_STAGES = [
  { key: "screened", label: "Screened" },
  { key: "associated", label: "Associated" },
  { key: "submitted-to-client", label: "Submitted" },
  { key: "interview", label: "Interview" },
  { key: "placed", label: "Placed" },
];

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [jobAssociationOpen, setJobAssociationOpen] = useState(false);
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const refreshCandidate = async () => {
    try {
      const data = await candidateService.getById(id);
      setCandidate(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Load candidate data
  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getById(id);
      setCandidate(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAssociation = () => {
    setJobAssociationOpen(true);
    handleActionsClose();
  };

  const handleScheduleInterview = () => {
    setScheduleInterviewOpen(true);
    handleActionsClose();
  };

  const handleJobAssociationSuccess = (message) => {
    setSnackbar({ open: true, message, severity: "success" });
    // Refresh candidate data to show new applications
    loadCandidate();
  };

  const handleInterviewScheduled = (interview) => {
    setSnackbar({ 
      open: true, 
      message: `Interview scheduled successfully for ${new Date(interview.scheduled_date).toLocaleDateString()}`, 
      severity: "success" 
    });
    // Refresh candidate data to show new activities
    loadCandidate();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  // Calculate highest pipeline stage
  const getCurrentPipelineStage = () => {
    if (!candidate?.applications || candidate.applications.length === 0) {
      return 0; // Screened (default for new candidates)
    }

    // Find highest stage index across all applications
    const maxStageIndex = candidate.applications.reduce((max, app) => {
      const stageIndex = PIPELINE_STAGES.findIndex(
        (stage) => stage.key === app.status
      );
      return Math.max(max, stageIndex >= 0 ? stageIndex : 0);
    }, 0);

    return maxStageIndex;
  };

  // Check if candidate has any applications submitted to client
  const hasSubmittedApplications = () => {
    return candidate?.applications?.some(app => app.submitted_to_client_date) || false;
  };

  // Handle actions menu
  const handleActionsClick = (event) => {
    setActionsAnchor(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActionsAnchor(null);
  };

  const handleSubmitToClient = () => {
    handleActionsClose();
    // TODO: Open submit to client dialog
    console.log("Submit to Client clicked");
  };

  const handleEditCandidate = () => {
    handleActionsClose();
    navigate(`/candidates/${id}/edit`);
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  if (!candidate) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Candidate not found</Alert>
      </Box>
    );
  }

  const currentStage = getCurrentPipelineStage();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Candidate Name and Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            {candidate.first_name} {candidate.last_name}
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
            <MenuItem onClick={handleJobAssociation}>
              <ListItemIcon>
                <WorkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Associate with Job</ListItemText>
            </MenuItem>
            
            <MenuItem 
              onClick={handleScheduleInterview}
              disabled={!hasSubmittedApplications()}
            >
              <ListItemIcon>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Schedule Interview</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleSubmitToClient}>Submit to Client</MenuItem>
            <MenuItem onClick={handleEditCandidate}>Edit Candidate</MenuItem>
          </Menu>
        </Box>

        {/* Contact Information */}
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body1">{candidate.email}</Typography>
          </Box>

          {candidate.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body1">{candidate.phone}</Typography>
            </Box>
          )}

          {candidate.linkedin_url && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body1">{candidate.linkedin_url}</Typography>
            </Box>
          )}

          {candidate.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body1">{candidate.location}</Typography>
            </Box>
          )}
        </Box>

        {/* Pipeline Progress */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Pipeline Progress: {PIPELINE_STAGES[currentStage]?.label}
          </Typography>

          <Stepper activeStep={currentStage} alternativeLabel>
            {PIPELINE_STAGES.map((stage, index) => (
              <Step key={stage.key} completed={index <= currentStage}>
                <StepLabel>{stage.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Documents" />
          <Tab label="Activity" />
          <Tab label="Applications" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && <OverviewTab candidate={candidate} />}
        {activeTab === 1 && (
          <DocumentsTab
            candidate={candidate}
            onDocumentChange={refreshCandidate}
          />
        )}
        {activeTab === 2 && <ActivityTab candidate={candidate} />}
        {activeTab === 3 && (
          <ApplicationsTab
            candidate={candidate}
            onAssociateJob={() => setJobAssociationOpen(true)}
          />
        )}
      </Paper>
      
      {/* Job Association Dialog */}
      <JobAssociationDialog
        open={jobAssociationOpen}
        onClose={() => setJobAssociationOpen(false)}
        candidate={candidate}
        onSuccess={handleJobAssociationSuccess}
      />

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={scheduleInterviewOpen}
        onClose={() => setScheduleInterviewOpen(false)}
        candidateId={candidate.id}
        onInterviewScheduled={handleInterviewScheduled}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateDetail;
