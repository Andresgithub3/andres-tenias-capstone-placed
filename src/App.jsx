import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './api/supabase';
import Login from './pages/Auth/Login';
import './styles/global.scss';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Temporary dashboard placeholder */}
        <Route path="/dashboard" element={
          session ? (
            <div>
              <h1>Dashboard (Placeholder)</h1>
              <p>You are logged in as: {session.user.email}</p>
              <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        {/* Redirect root to dashboard if logged in, otherwise to login */}
        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
