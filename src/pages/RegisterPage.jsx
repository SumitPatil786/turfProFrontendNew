import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'USER', otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // New state to track if OTP has been sent
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validatePreOtp = () => {
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const err = validatePreOtp();
    if (err) { setError(err); return; }
    
    setLoading(true);
    setError('');
    try {
      await userApi.sendOtp(form.email.trim().toLowerCase());
      setOtpSent(true);
      alert('OTP sent to your email!'); // Optional: Replace with a nice toast notification
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to send OTP. Email might be in use.';
      setError(typeof msg === 'string' ? msg : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

const handleRegister = async (e) => {
    e.preventDefault();
    
    // Clean the OTP: removes ALL spaces, even in the middle
    const cleanOtp = form.otp ? form.otp.replace(/\s/g, '') : '';

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await userApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
        otp: cleanOtp // 👈 Send the perfectly cleaned OTP
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data?.error || err.response?.data || 'Registration failed.';
      if (typeof msg === 'string' && msg.includes('Duplicate entry')) msg = 'An account with these details already exists.';
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

            <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="auth-form">
              
              {/* Disable these inputs once OTP is sent so they don't change it mid-way */}
              <fieldset disabled={otpSent} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-input" placeholder="9876543210" value={form.phone} onChange={handleChange} maxLength={10} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                    <option value="USER">Player (User) — Book turfs and manage your games</option>
                    <option value="OWNER">Turf Owner — Manage your specific turfs and slots</option>
                    <option value="ADMIN">System Admin — Manage all turfs and users</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} />
                </div>
              </fieldset>

              {/* 👇 OTP FIELD APPEARS HERE ONCE SENT 👇 */}
              {otpSent && (
                <div className="form-group" style={{ marginTop: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
                  <label className="form-label" style={{ color: '#0f172a' }}>Enter 6-Digit OTP sent to {form.email}</label>
                  <input 
                    type="text" 
                    name="otp" 
                    className="form-input" 
                    placeholder="123456" 
                    value={form.otp} 
                    onChange={handleChange} 
                    maxLength={6}
                    style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}
                  />
                  <button type="button" onClick={() => setOtpSent(false)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
                    Edit Email / Resend OTP
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 16 }}>
                {loading ? (
                  <><span className="btn-spinner" /> Processing...</>
                ) : otpSent ? (
                  'Verify & Create Account ✨'
                ) : (
                  'Send OTP to Email →'
                )}
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