import React from "react";
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

// Mock data - will be replaced with real data later
const dashboardStats = [
  {
    title: 'Total Open Jobs',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: <Work />,
    color: 'primary',
  },
  {
    title: 'Active Contractors',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: <People />,
    color: 'secondary',
  },
  {
    title: 'Interviews This Week',
    value: '18',
    change: '+5%',
    changeType: 'positive',
    icon: <CalendarToday />,
    color: 'success',
  },
  {
    title: 'Permanent Placements This Month',
    value: '7',
    change: '+40%',
    changeType: 'positive',
    icon: <TrendingUp />,
    color: 'warning',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'interview',
    title: 'Interview scheduled with Sarah Johnson',
    subtitle: 'Senior Frontend Developer position',
    time: '2 hours ago',
    icon: <CalendarToday />,
  },
  {
    id: 2,
    type: 'application',
    title: 'New application received',
    subtitle: 'Backend Developer - TechCorp',
    time: '4 hours ago',
    icon: <Assignment />,
  },
  {
    id: 3,
    type: 'placement',
    title: 'Candidate placed successfully',
    subtitle: 'John Doe - Full Stack Developer',
    time: '1 day ago',
    icon: <CheckCircle />,
  },
  {
    id: 4,
    type: 'job',
    title: 'New job posting created',
    subtitle: 'UX Designer - StartupXYZ',
    time: '2 days ago',
    icon: <Work />,
  },
];

const upcomingInterviews = [
  {
    id: 1,
    candidate: 'Alice Cooper',
    position: 'Product Manager',
    company: 'TechStart Inc.',
    time: '10:00 AM',
    type: 'Final Round',
  },
  {
    id: 2,
    candidate: 'Bob Williams',
    position: 'Data Scientist',
    company: 'DataCorp',
    time: '2:00 PM',
    type: 'Technical Interview',
  },
  {
    id: 3,
    candidate: 'Carol Davis',
    position: 'UI/UX Designer',
    company: 'DesignHub',
    time: '4:30 PM',
    type: 'Portfolio Review',
  },
];

const StatCard = ({ stat }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            {stat.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stat.title}
          </Typography>
        </Box>
      </Box>
      <Chip
        label={stat.change}
        size="small"
        color={stat.changeType === 'positive' ? 'success' : 'error'}
        variant="outlined"
      />
    </CardContent>
  </Card>
);

const Dashboard = () => {
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Recent Activities</Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem
                  key={activity.id}
                  divider={index < recentActivities.length - 1}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                      }}
                    >
                      {activity.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {activity.subtitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Interviews */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Today's Interviews</Typography>
              <Button variant="outlined" size="small">
                Calendar
              </Button>
            </Box>
            <List>
              {upcomingInterviews.map((interview, index) => (
                <ListItem
                  key={interview.id}
                  divider={index < upcomingInterviews.length - 1}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.light',
                        color: 'secondary.main',
                      }}
                    >
                      <Person />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography variant="body2" fontWeight="medium" component="span" sx={{ display: 'block' }}>
                          {interview.candidate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {interview.position} • {interview.company}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }} component="span">
                        <Schedule fontSize="small" />
                        <Typography variant="caption" component="span">
                          {interview.time}
                        </Typography>
                        <Chip
                          label={interview.type}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
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