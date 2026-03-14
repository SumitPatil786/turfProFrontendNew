import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import TurfCard from '../components/turf/TurfCard';
import './HomePage.css';

const STATS = [
  { value: '50+', label: 'Premium Turfs' },
  { value: '1200+', label: 'Happy Players' },
  { value: '5', label: 'Sports Available' },
  { value: '4.8★', label: 'Average Rating' },
];

const SPORTS = [
  { icon: '🏏', name: 'Cricket', color: '#fef9c3' },
  { icon: '⚽', name: 'Football', color: '#dcfce7' },
  { icon: '🏸', name: 'Badminton', color: '#dbeafe' },
  { icon: '🏀', name: 'Basketball', color: '#ffedd5' },
  { icon: '🎾', name: 'Tennis', color: '#fce7f3' },
];

const HomePage = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    turfApi.getAllTurfs()
      .then(res => setTurfs(res.data.slice(0, 6)))
      .catch(() => setTurfs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero__bg-pattern" />
        <div className="container hero__container">
          <div className="hero__content">
            <div className="hero__eyebrow">
              <span>🟢</span> Slots available today
            </div>
            <h1 className="hero__title">
              Book Your Perfect<br />
              <span className="hero__title-highlight">Sports Turf</span><br />
              In Minutes
            </h1>
            <p className="hero__subtitle">
              Discover premium turfs near you. Choose your sport, pick a slot,
              and play. It's that simple.
            </p>
            <div className="hero__actions">
              <Link to="/turfs" className="btn btn-primary btn-lg">
                Browse Turfs →
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Account
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__card-stack">
              <div className="hero__floating-card hero__floating-card--1">
                <span>⚽</span>
                <div>
                  <p>Green Arena</p>
                  <small>Football · Pune</small>
                </div>
                <strong>₹800/hr</strong>
              </div>
              <div className="hero__floating-card hero__floating-card--2">
                <span>🏏</span>
                <div>
                  <p>Cricket Hub</p>
                  <small>Cricket · PCMC</small>
                </div>
                <strong>₹1200/hr</strong>
              </div>
              <div className="hero__floating-card hero__floating-card--3">
                <span>🏸</span>
                <div>
                  <p>Shuttle Court</p>
                  <small>Badminton · Baner</small>
                </div>
                <strong>₹400/hr</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(stat => (
              <div key={stat.label} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPORTS FILTER ─── */}
      <section className="sports-section page-wrapper" style={{ paddingTop: '60px', paddingBottom: '0' }}>
        <div className="container">
          <div className="section-header text-center">
            <div className="section-eyebrow">🏅 What We Offer</div>
            <h2 className="section-title">Pick Your Sport</h2>
            <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
              All sports, all levels — we have turf for everyone.
            </p>
          </div>
          <div className="sports-grid">
            {SPORTS.map(sport => (
              <button
                key={sport.name}
                className="sport-chip"
                style={{ '--chip-bg': sport.color }}
                onClick={() => navigate('/turfs')}
              >
                <span className="sport-chip__icon">{sport.icon}</span>
                <span className="sport-chip__name">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED TURFS ─── */}
      <section className="featured-section page-wrapper">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="section-eyebrow">⭐ Top Picks</div>
              <h2 className="section-title">Featured Turfs</h2>
            </div>
            <Link to="/turfs" className="btn btn-ghost">View All →</Link>
          </div>

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /><span>Loading turfs...</span></div>
          ) : turfs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏟️</div>
              <h3>No turfs yet</h3>
              <p>Turfs will appear here once added by admin</p>
            </div>
          ) : (
            <div className="turfs-grid">
              {turfs.map(turf => (
                <TurfCard key={turf.turfId} turf={turf} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-eyebrow">📖 Process</div>
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '🔍', title: 'Browse Turfs', desc: 'Search and filter turfs by sport type, location, and availability.' },
              { step: '02', icon: '📅', title: 'Pick a Slot', desc: 'Choose your preferred date and time slot that works for you.' },
              { step: '03', icon: '💳', title: 'Confirm & Pay', desc: 'Fill in details and confirm your booking instantly.' },
              { step: '04', icon: '🏃', title: 'Play!', desc: 'Show up at the turf and enjoy your game. It\'s that easy!' },
            ].map(item => (
              <div key={item.step} className="step-card">
                <div className="step-card__num">{item.step}</div>
                <div className="step-card__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Play?</h2>
            <p>Join thousands of players booking their favourite turfs on TurfPro.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/turfs" className="btn btn-secondary btn-lg">Explore Turfs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
