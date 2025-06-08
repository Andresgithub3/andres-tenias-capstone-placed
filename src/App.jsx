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
import CandidatesList from './components/pages/Candidates/CandidatesList';
import CandidateDetail from "./components/pages/Candidates/CandidateDetail";
// import JobsList from './components/pages/Jobs/JobsList';

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
  // // State to hold the Supabase connection test status
  // const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState(
  //   "Checking Supabase connection..."
  // );

  // // useEffect hook to run the Supabase connection test once on component mount
  // useEffect(() => {
  //   const testSupabaseConnection = async () => {
  //     try {
  //       // Attempt to get the current session. This is a common way to test
  //       // if the Supabase client can reach the backend.
  //       const {
  //         data: { session },
  //         error,
  //       } = await supabase.auth.getSession();

  //       if (error) {
  //         // If there's an error, it means the connection failed or keys are wrong
  //         setSupabaseConnectionStatus(
  //           `Supabase Connection Error: ${error.message}`
  //         );
  //         console.error("Supabase connection test failed:", error);
  //       } else if (session) {
  //         // If a session exists, the connection is good and a user is logged in
  //         setSupabaseConnectionStatus(
  //           `Supabase Connected! User: ${session.user.email}`
  //         );
  //         console.log("Supabase session:", session);
  //       } else {
  //         // If no error and no session, the connection is good but no user is logged in
  //         setSupabaseConnectionStatus(
  //           "Supabase Connected! No active session (user not logged in)."
  //         );
  //         console.log("Supabase connection successful, no active session.");
  //       }
  //     } catch (err) {
  //       // Catch any errors during the initial creation or call to supabase
  //       setSupabaseConnectionStatus(
  //         `Supabase Initialization Error: ${err.message}`
  //       );
  //       console.error("Supabase initialization failed:", err);
  //     }
  //   };

  //   testSupabaseConnection();
  // }, []); // The empty dependency array ensures this runs only once when App mounts

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
          {/* <Route path="jobs" element={<Jobs />} /> */}
          {/* <Route path="candidates" element={<Candidates />} /> */}
          <Route path="candidates" element={<CandidatesList />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
          {/* <Route path="interviews" element={<Interviews />} /> */}
          {/* <Route path="companies" element={<Companies />} /> */}
          {/* <Route path="analytics" element={<Analytics />} /> */}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
