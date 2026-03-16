import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/booking/BookingCard';
import './MyBookingsPage.css';

const FILTERS = ['ALL', 'CONFIRMED', 'CANCELLED'];

const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = () => {
    // NOTE: original backend UserResponseDto.userId may be null due to ModelMapper
    // field mismatch (User.id vs userId). If null, we fall back to all bookings
    // filtered by name, or show a friendly message.
    if (!user) return;
    const uid = user.userId ?? user.id;
    if (!uid) {
      setError('User ID not available. This is a known backend issue — the backend returns userId as null due to a ModelMapper field mismatch (User.id ≠ userId). Please fix the backend UserService to manually set userId.');
      setLoading(false);
      return;
    }
    setLoading(true);
    bookingApi.getBookingsByUser(uid)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sorted);
        setFiltered(sorted);
      })
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [user]);

  useEffect(() => {
    if (activeFilter === 'ALL') {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter(b => (b.status || b.bookingStatus || 'CONFIRMED') === activeFilter));
    }
  }, [activeFilter, bookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      await bookingApi.cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => (b.status || 'CONFIRMED') === 'CONFIRMED').length,
    cancelled: bookings.filter(b => (b.status || '') === 'CANCELLED').length,
    spent: bookings
      .filter(b => (b.status || 'CONFIRMED') !== 'CANCELLED')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  return (
    <div className="my-bookings page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="my-bookings__header">
          <div>
            <div className="section-eyebrow">📅 Your Activity</div>
            <h1 className="section-title">My Bookings</h1>
            <p className="section-subtitle">Track and manage all your turf reservations</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/turfs')}>
            + Book a Turf
          </button>
        </div>

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="my-bookings__stats">
            <div className="my-bookings__stat">
              <span className="my-bookings__stat-val">{stats.total}</span>
              <span className="my-bookings__stat-label">Total Bookings</span>
            </div>
            <div className="my-bookings__stat">
              <span className="my-bookings__stat-val" style={{ color: 'var(--green-600)' }}>{stats.confirmed}</span>
              <span className="my-bookings__stat-label">Confirmed</span>
            </div>
            <div className="my-bookings__stat">
              <span className="my-bookings__stat-val" style={{ color: 'var(--error)' }}>{stats.cancelled}</span>
              <span className="my-bookings__stat-label">Cancelled</span>
            </div>
            <div className="my-bookings__stat">
              <span className="my-bookings__stat-val">₹{stats.spent.toLocaleString()}</span>
              <span className="my-bookings__stat-label">Total Spent</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="my-bookings__tabs">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`my-bookings__tab${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'ALL' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => (b.status || b.bookingStatus || 'CONFIRMED') === f).length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner" />
            <span>Loading your bookings...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>{activeFilter === 'ALL' ? "No bookings yet" : `No ${activeFilter.toLowerCase()} bookings`}</h3>
            <p>{activeFilter === 'ALL' ? "Book your first turf and start playing!" : "Try a different filter."}</p>
            {activeFilter === 'ALL' && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/turfs')}>
                Browse Turfs →
              </button>
            )}
          </div>
        ) : (
          <div className="my-bookings__list">
            {filtered.map(booking => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onCancel={cancellingId ? null : handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
