import { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, Card, CardContent } from "@mui/material";
import {
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Source as SourceIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import ResumeViewer from "../../documents/ResumeViewer";
import { storageService } from "../../../services/storageService";
import { candidateService } from "../../../services/candidateService";

const OverviewTab = ({ candidate }) => {
  const [primaryResume, setPrimaryResume] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  useEffect(() => {
    loadPrimaryResume();
  }, [candidate.id]);

  const loadPrimaryResume = async () => {
    try {
      setResumeLoading(true);
      const resume = await candidateService.getPrimaryResume(candidate.id);

      if (resume) {
        setPrimaryResume(resume);
        const url = await storageService.getViewUrl(resume.file_path);
        setResumeUrl(url);
      }
    } catch (error) {
      console.error("Error loading primary resume:", error);
    } finally {
      setResumeLoading(false);
    }
  };

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return [];
    return Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim());
  };

  const handleResumeDownload = async (documentUrl, fileName) => {
    try {
      // Create a temporary link to download the file
      const link = window.document.createElement("a");
      link.href = documentUrl;
      link.download = fileName;
      link.target = "_blank";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 3, height: "600px" }}>
      {/* Left Side - Candidate Information (40%) */}
      <Box
        sx={{
          width: "40%",
          minWidth: "40%",
          height: "100%",
          overflowY: "auto",
          pr: 1,
        }}
      >
        {/* Basic Information */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WorkIcon fontSize="small" />
              Basic Information
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Full Name
              </Typography>
              <Typography variant="body1">
                {candidate.first_name} {candidate.last_name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1">{candidate.email}</Typography>
            </Box>

            {candidate.phone && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phone
                </Typography>
                <Typography variant="body1">{candidate.phone}</Typography>
              </Box>
            )}

            {candidate.location && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <LocationIcon fontSize="small" />
                  {candidate.location}
                </Typography>
              </Box>
            )}

            {candidate.source && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Source
                </Typography>
                <Chip
                  label={candidate.source}
                  size="small"
                  icon={<SourceIcon />}
                  variant="outlined"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skills & Expertise
            </Typography>

            {formatSkills(candidate.skills).length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formatSkills(candidate.skills).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No skills listed</Typography>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        {candidate.experience_years && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <SchoolIcon fontSize="small" />
                Experience
              </Typography>
              <Typography variant="body1">
                {candidate.experience_years}{" "}
                {candidate.experience_years === 1 ? "year" : "years"} of
                experience
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        {candidate.rating && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <StarIcon fontSize="small" />
                Rating
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${candidate.rating}/5`}
                  color={
                    candidate.rating >= 4
                      ? "success"
                      : candidate.rating >= 3
                      ? "warning"
                      : "error"
                  }
                />
                <Typography variant="body2" color="text.secondary">
                  Overall assessment
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {candidate.notes && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {candidate.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Right Side - Resume Viewer (60%) */}
      <Box
        sx={{
          width: "60%",
          minWidth: "60%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          sx={{
            height: "100%",
            p: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Prevent content from overflowing
          }}
        >
          <ResumeViewer
            documentUrl={resumeUrl}
            fileName={primaryResume?.file_name}
            loading={resumeLoading}
            onDoanload={handleResumeDownload}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default OverviewTab;
