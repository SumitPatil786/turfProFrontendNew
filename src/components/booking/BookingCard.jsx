import React from 'react';
import './BookingCard.css';

const BookingCard = ({ booking, onCancel, onDelete, isAdmin = false }) => {
  const status = booking.status || booking.bookingStatus || 'CONFIRMED';

  const statusClass = {
    CONFIRMED: 'badge-green',
    CANCELLED: 'badge-red',
    COMPLETED: 'badge-blue',
  }[status] || 'badge-gray';

  const formatDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '--';
    const [h, m] = time.toString().split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m || '00'} ${ampm}`;
  };

  const canCancel = status === 'CONFIRMED';

  return (
    <div className={`booking-card${status === 'CANCELLED' ? ' booking-card--cancelled' : ''}`}>
      <div className="booking-card__header">
        <div className="booking-card__turf-info">
          <span className="booking-card__icon">🏟️</span>
          <div>
            <h3 className="booking-card__turf-name">{booking.turfName || 'Unknown Turf'}</h3>
            {isAdmin && (
              <span className="booking-card__user">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                {booking.userName}
              </span>
            )}
          </div>
        </div>
        <span className={`badge ${statusClass}`}>{status}</span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__detail">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="booking-card__detail">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>
            {booking.startTime ? `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}` : 'Full Day'}
          </span>
        </div>
        <div className="booking-card__detail booking-card__detail--amount">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <span>₹{booking.totalAmount || '—'}</span>
        </div>
        <div className="booking-card__detail">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h8M4 18h8"/></svg>
          <span>ID: #{booking.bookingId}</span>
        </div>
      </div>

      <div className="booking-card__actions">
        {canCancel && onCancel && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(booking.bookingId)}
          >
            Cancel Booking
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            className="btn btn-sm"
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
            onClick={() => onDelete(booking.bookingId)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
