import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TurfCard.css';

const SPORT_ICONS = {
  CRICKET: '🏏',
  FOOTBALL: '⚽',
  BADMINTON: '🏸',
  BASKETBALL: '🏀',
  TENNIS: '🎾',
};

const SPORT_COLORS = {
  CRICKET: '#fef3c7',
  FOOTBALL: '#dcfce7',
  BADMINTON: '#dbeafe',
  BASKETBALL: '#ffedd5',
  TENNIS: '#fce7f3',
};

const TurfCard = ({ turf }) => {
  const navigate = useNavigate();
  const icon = SPORT_ICONS[turf.sportType?.toUpperCase()] || '🏟️';
  const bgColor = SPORT_COLORS[turf.sportType?.toUpperCase()] || '#f1f5f9';

  const formatTime = (time) => {
    if (!time) return '--';
    const [h, m] = time.toString().split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m || '00'} ${ampm}`;
  };

  return (
    <div className="turf-card" onClick={() => navigate(`/turfs/${turf.turfId}`)}>
      
      {/* 📸 SINGLE CORRECTED BANNER */}
      <div 
        className="turf-card__banner" 
        style={{ 
          background: turf.imageUrl ? `url(${turf.imageUrl}) center/cover no-repeat` : bgColor 
        }}
      >
        {!turf.imageUrl && <span className="turf-card__sport-icon">{icon}</span>}
        <span className="badge badge-green turf-card__sport-badge">
          {turf.sportType}
        </span>
      </div>

      <div className="turf-card__body">
        <h3 className="turf-card__name">{turf.turfName}</h3>
        <div className="turf-card__meta">
          <span className="turf-card__meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {turf.location}
          </span>
          <span className="turf-card__meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            {turf.areaInMetres} m²
          </span>
        </div>
        <p className="turf-card__description">
          {turf.description || `Premium ${turf.sportType?.toLowerCase()} turf available for booking.`}
        </p>
        <div className="turf-card__footer">
          <div className="turf-card__price">
            <span className="turf-card__price-amount">₹{turf.pricePerHour}</span>
            <span className="turf-card__price-label">/hour</span>
          </div>
          <div className="turf-card__timing">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {formatTime(turf.openTime)} – {formatTime(turf.closeTime)}
          </div>
        </div>
        <button className="btn btn-primary btn-full turf-card__btn">
          Book Now →
        </button>
      </div>
    </div>
  );
};

export default TurfCard;