import React, { useEffect, useState } from 'react';
import { turfApi } from '../api/turfApi';
import TurfCard from '../components/turf/TurfCard';
import './TurfsPage.css';

const SPORT_FILTERS = ['ALL', 'CRICKET', 'FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS'];

const TurfsPage = () => {
  const [turfs, setTurfs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    turfApi.getAllTurfs()
      .then(res => {
        setTurfs(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError('Failed to load turfs. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = turfs;
    if (activeFilter !== 'ALL') {
      result = result.filter(t => t.sportType?.toUpperCase() === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.turfName?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.address?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeFilter, search, turfs]);

  return (
    <div className="turfs-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="turfs-page__header">
          <div>
            <div className="section-eyebrow">🏟️ Discover</div>
            <h1 className="section-title">Available Turfs</h1>
            <p className="section-subtitle">
              Browse our collection of premium sports turfs. Book in seconds.
            </p>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="turfs-page__controls">
          <div className="turfs-page__search-wrap">
            <svg className="turfs-page__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="turfs-page__search"
              placeholder="Search by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="turfs-page__search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="turfs-page__filters">
            {SPORT_FILTERS.map(f => (
              <button
                key={f}
                className={`turfs-page__filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === 'ALL' ? '🏟️ All' :
                  f === 'CRICKET' ? '🏏 Cricket' :
                  f === 'FOOTBALL' ? '⚽ Football' :
                  f === 'BADMINTON' ? '🏸 Badminton' :
                  f === 'BASKETBALL' ? '🏀 Basketball' :
                  '🎾 Tennis'}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <p className="turfs-page__count">
            Showing <strong>{filtered.length}</strong> turf{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'ALL' && ` for ${activeFilter}`}
            {search && ` matching "${search}"`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner" />
            <span>Loading turfs from backend...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <strong>Error loading turfs</strong>
              <p style={{ marginTop: 4, fontSize: 13 }}>{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏟️</div>
            <h3>No turfs found</h3>
            <p>Try a different filter or search term</p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: 16 }}
              onClick={() => { setActiveFilter('ALL'); setSearch(''); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="turfs-grid">
            {filtered.map(turf => (
              <TurfCard key={turf.turfId} turf={turf} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfsPage;
