import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await userApi.login(form.email, form.password);
      const data = res.data;
      login(data); // AuthContext handles token extraction
      
      const role = String(data.role || '').toUpperCase();
      
      // 👇 ROUTING LOGIC UPDATED HERE 👇
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'OWNER') {
        navigate('/owner', { replace: true });
      } else {
        navigate(from, { replace: true });
      }

    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || 'Invalid email or password. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-left__content">
            <Link to="/" className="auth-logo">⚽ TurfPro</Link>
            <h2>Welcome back,<br />Champion! 👋</h2>
            <p>Sign in to access your bookings, manage your profile, and book your next game.</p>
            <div className="auth-features">
              <div className="auth-feature"><span>✅</span> Instant slot confirmation</div>
              <div className="auth-feature"><span>✅</span> Easy cancellation & rescheduling</div>
              <div className="auth-feature"><span>✅</span> Multiple payment methods</div>
              <div className="auth-feature"><span>✅</span> Booking history & receipts</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card__header">
              <h1>Sign In</h1>
              <p>Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <><span className="btn-spinner" /> Signing in...</>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="auth-divider"><span>Don't have an account?</span></div>

            <Link to="/register" className="btn btn-secondary btn-full">
              Create a Free Account
            </Link>

            <p className="auth-admin-note">
              Turf Owner or Admin? Sign in here to access your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;