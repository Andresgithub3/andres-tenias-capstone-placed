import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  Assignment as RequirementsIcon,
  EmojiObjects as NiceToHaveIcon,
} from "@mui/icons-material";

const JobOverviewTab = ({ job }) => {
  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return [];
    return Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim());
  };

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* Left Column - Job Details (60%) */}
      <Box sx={{ width: "60%" }}>
        {/* Job Description */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WorkIcon fontSize="small" />
              Job Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {job.description || "No description provided"}
            </Typography>
          </CardContent>
        </Card>

        {/* Requirements */}
        {job.requirements && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <RequirementsIcon fontSize="small" />
                Requirements
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {job.requirements}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Nice to Have */}
        {job.nice_to_have && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <NiceToHaveIcon fontSize="small" />
                Nice to Have
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {job.nice_to_have}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Right Column - Additional Info (40%) */}
      <Box sx={{ width: "40%" }}>
        {/* Company Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <BusinessIcon fontSize="small" />
              Company Information
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Company Name
              </Typography>
              <Typography variant="body1">
                {job.company?.name || "N/A"}
              </Typography>
            </Box>

            {job.company?.location_city && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Company Location
                </Typography>
                <Typography variant="body1">
                  {[job.company.location_city, job.company.location_state]
                    .filter(Boolean)
                    .join(", ")}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Job Details
            </Typography>

            {job.department && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Department
                </Typography>
                <Typography variant="body1">{job.department}</Typography>
              </Box>
            )}

            {job.employment_type && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employment Type
                </Typography>
                <Typography variant="body1">{job.employment_type}</Typography>
              </Box>
            )}

            {job.experience_level && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Experience Level
                </Typography>
                <Typography variant="body1">{job.experience_level}</Typography>
              </Box>
            )}

            {job.priority && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Priority
                </Typography>
                <Chip
                  label={job.priority}
                  size="small"
                  color={
                    job.priority === "high"
                      ? "error"
                      : job.priority === "medium"
                      ? "warning"
                      : "default"
                  }
                />
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Positions
              </Typography>
              <Typography variant="body1">
                {job.positions_filled || 0} filled of{" "}
                {job.positions_available || 1} available
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Skills */}
        {formatSkills(job.skills).length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formatSkills(job.skills).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default JobOverviewTab;
