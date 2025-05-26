// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { supabase } from './api/supabase';
// import Login from './pages/Auth/Login';
// import './styles/global.scss';

// function App() {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setLoading(false);
//     });

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setSession(session);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

//         {/* Temporary dashboard placeholder */}
//         <Route path="/dashboard" element={
//           session ? (
//             <div>
//               <h1>Dashboard (Placeholder)</h1>
//               <p>You are logged in as: {session.user.email}</p>
//               <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
//             </div>
//           ) : (
//             <Navigate to="/login" />
//           )
//         } />

//         {/* Redirect root to dashboard if logged in, otherwise to login */}
//         <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useTheme } from "./theme context/ThemContext";

function App() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with theme toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" color="primary">
          Recruitment CRM Platform
        </Typography>
        <IconButton onClick={toggleTheme} color="primary">
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      {/* Welcome Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Welcome to your CRM Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Material UI has been successfully integrated! This is your
            recruitment platform foundation.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip icon={<DashboardIcon />} label="Dashboard" color="primary" />
            <Chip icon={<WorkIcon />} label="Jobs" color="secondary" />
            <Chip icon={<PeopleIcon />} label="Candidates" color="success" />
          </Stack>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        <Card>
          <CardContent>
            <WorkIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Job Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, edit, and manage job postings with ease.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Candidate Pipeline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track candidates through your recruitment process.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DashboardIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get insights into your recruitment metrics.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Test Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary">
          Primary Button
        </Button>
        <Button variant="contained" color="secondary">
          Secondary Button
        </Button>
        <Button variant="outlined">Outlined Button</Button>
        <Button variant="text">Text Button</Button>
      </Box>

      {/* Theme Status */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Current theme: <strong>{isDarkMode ? "Dark" : "Light"}</strong> mode
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Material UI is working! Your preferences are saved automatically.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
