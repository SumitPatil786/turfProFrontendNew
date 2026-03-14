import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
    <div>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🏟️</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, color: 'var(--green-600)', lineHeight: 1, marginBottom: 12 }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--slate-800)', marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: 'var(--slate-500)', marginBottom: 28 }}>Looks like you kicked the ball out of bounds!</p>
      <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
