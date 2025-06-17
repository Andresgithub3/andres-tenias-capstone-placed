import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  People,
  Work,
  CalendarToday,
  Assignment,
  CheckCircle,
  Schedule,
  Person,
} from "@mui/icons-material";
import { dashboardService } from "../../services/dashboardService";
import { useNavigate } from "react-router-dom";

const StatCard = ({ stat, loading }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${stat.color}.main`,
            color: `${stat.color}.contrastText`,
            mr: 2,
          }}
        >
          {stat.icon}
        </Box>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {loading ? <CircularProgress size={24} /> : stat.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stat.title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOpenJobs: 0,
    activeContractors: 0,
    interviewsThisWeek: 0,
    permanentPlacementsThisMonth: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysInterviews, setTodaysInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load all dashboard data in parallel
      const [statsData, activitiesData, interviewsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(),
        dashboardService.getTodaysInterviews(),
      ]);

      setStats(statsData);
      setRecentActivities(activitiesData);
      setTodaysInterviews(interviewsData);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create dashboard stats array with real data
  const dashboardStats = [
    {
      title: "Total Open Jobs",
      value: stats.totalOpenJobs.toString(),
      icon: <Work />,
      color: "primary",
    },
    {
      title: "Active Contractors",
      value: stats.activeContractors.toString(),
      icon: <People />,
      color: "secondary",
    },
    {
      title: "Interviews This Week",
      value: stats.interviewsThisWeek.toString(),
      icon: <CalendarToday />,
      color: "success",
    },
    {
      title: "Permanent Placements This Month",
      value: stats.permanentPlacementsThisMonth.toString(),
      icon: <TrendingUp />,
      color: "warning",
    },
  ];

  // Map activity types to icons and descriptions
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "interview":
      case "call":
        return <CalendarToday />;
      case "email":
      case "note":
        return <Assignment />;
      case "meeting":
        return <People />;
      default:
        return <Assignment />;
    }
  };

  const formatActivityDescription = (activity) => {
    const entityMap = {
      candidate: "Candidate",
      job: "Job",
      company: "Company",
    };

    return {
      title: `${
        activity.activity_type.charAt(0).toUpperCase() +
        activity.activity_type.slice(1)
      } - ${entityMap[activity.entity_type] || "Unknown"}`,
      subtitle: activity.description || `${activity.activity_type} activity`,
      time: new Date(activity.created_at).toLocaleDateString(),
    };
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your recruitment pipeline today.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard stat={stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Recent Activities</Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recentActivities.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 3 }}
              >
                No recent activities found
              </Typography>
            ) : (
              <List>
                {recentActivities.map((activity, index) => {
                  const formattedActivity = formatActivityDescription(activity);
                  return (
                    <ListItem
                      key={activity.id}
                      divider={index < recentActivities.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "primary.light",
                            color: "primary.main",
                          }}
                        >
                          {getActivityIcon(activity.activity_type)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={formattedActivity.title}
                        secondary={
                          <Box component="span" sx={{ display: "block" }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: "block" }}
                            >
                              {formattedActivity.subtitle}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                              sx={{ display: "block" }}
                            >
                              {formattedActivity.time}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Today's Interviews */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Today's Interviews</Typography>
              <Button variant="outlined" size="small">
                Calendar
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : todaysInterviews.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 3 }}
              >
                No interviews scheduled for today
              </Typography>
            ) : (
              <List>
                {todaysInterviews.map((interview, index) => (
                  <ListItem
                    key={interview.id}
                    divider={index < todaysInterviews.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: "secondary.light",
                          color: "secondary.main",
                        }}
                      >
                        <Person />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: "block" }}>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            component="span"
                            sx={{ display: "block" }}
                          >
                            {interview.candidate_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                            sx={{ display: "block" }}
                          >
                            {interview.job_title} • {interview.company_name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                          component="span"
                        >
                          <Schedule fontSize="small" />
                          <Typography variant="caption" component="span">
                            {formatTime(interview.scheduled_date)}
                          </Typography>
                          <Chip
                            label={interview.interview_type || "Interview"}
                            size="small"
                            variant="outlined"
                            sx={{ ml: "auto" }}
                          />
                        </Box>
                      }
                      primaryTypographyProps={{ component: "div" }}
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Work />}
                  sx={{ py: 2 }}
                  onClick={() => navigate("/jobs/new")}
                >
                  Create New Job
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  sx={{ py: 2 }}
                  onClick={() => navigate("/candidates/new")}
                >
                  Add Candidate
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CalendarToday />}
                  sx={{ py: 2 }}
                  disabled
                >
                  Schedule Interview
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{ py: 2 }}
                  disabled
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
