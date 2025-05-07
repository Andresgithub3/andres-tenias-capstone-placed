import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../../api/auth";
import '../../styles/login.scss';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

      const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await signIn(email, password);

        if (error) throw error;

        // If successful, redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        setError(error.message || "Failed to sign in");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Placed</div>
          <h1 className="auth-title">Sign in to your account</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
