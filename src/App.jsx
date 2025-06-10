import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "./contexts/AuthContext";
// import { supabase } from "./api/client/supabase"; used this to test connection to Supabase

// Auth Components
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";

// Database tester component
import DatabaseTester from "./components/DatabaseTester";

// Layout Components
import AppLayout from "./components/layout/AppLayout";

// Page Components
import Dashboard from "./components/dashboard/Dashboard";
import CandidatesList from "./components/pages/Candidates/CandidatesList";
import CandidateDetail from "./components/pages/Candidates/CandidateDetail";
import JobsList from "./components/pages/Jobs/JobsList";
import JobForm from "./components/pages/Jobs/JobForm";
import JobDetail from "./components/pages/Jobs/JobDetail";
import CompaniesList from "./components/pages/Companies/CompaniesList";
import CompanyForm from "./components/pages/Companies/CompanyForm";
import CompanyDetail from "./components/pages/Companies/CompanyDetails";

// Loading Component
const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: 2,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="test-db" element={<DatabaseTester />} />
          {/* Nested routes that will render inside AppLayout */}
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="candidates" element={<CandidatesList />} />
          <Route path="jobs" element={<JobsList />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="companies/new" element={<CompanyForm />} />
          <Route path="companies/:id/edit" element={<CompanyForm />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
