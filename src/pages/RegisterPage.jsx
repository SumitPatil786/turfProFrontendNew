import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit Indian phone number';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      // Send role as uppercase string — backend maps to enum/role table
      await userApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,   // "USER" or "ADMIN"
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      // Grab whatever error the backend sent
      let msg = err.response?.data?.message 
            || err.response?.data?.error 
            || err.response?.data 
            || 'Registration failed.';

      // 🛠️ INTERCEPT RAW SQL ERRORS
      if (typeof msg === 'string' && msg.includes('Duplicate entry')) {
        if (msg.includes(form.phone)) {
          msg = 'An account with this phone number already exists.';
        } else if (msg.includes(form.email)) {
          msg = 'An account with this email address is already in use.';
        } else {
          msg = 'An account with these details already exists. Please log in.';
        }
      }

      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-success-screen">
          <div style={{ fontSize: 64 }}>🎉</div>
          <h2>Account Created!</h2>
          <p>Redirecting you to login...</p>
          <div className="spinner" style={{ marginTop: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-left__content">
            <Link to="/" className="auth-logo">⚽ TurfPro</Link>
            <h2>Join the Game,<br />Join TurfPro! 🏆</h2>
            <p>Create your free account and start booking premium sports turfs in your city today.</p>
            <div className="auth-features">
              <div className="auth-feature"><span>⚡</span> Book in under 60 seconds</div>
              <div className="auth-feature"><span>🔒</span> Secure payments</div>
              <div className="auth-feature"><span>📅</span> Flexible scheduling</div>
              <div className="auth-feature"><span>🎯</span> Choose from 5+ sports</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card__header">
              <h1>Create Account</h1>
              <p>Fill in your details to get started</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                  <option value="USER">Player (User) — Book turfs and manage your games</option>
                  <option value="ADMIN">Admin — Manage turfs, slots and all bookings</option>
                  <option value="OWNER">Turf Owner — Manage your specific turfs and slots</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? (
                  <><span className="btn-spinner" /> Creating account...</>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="auth-divider"><span>Already have an account?</span></div>
            <Link to="/login" className="btn btn-secondary btn-full">Sign In Instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
