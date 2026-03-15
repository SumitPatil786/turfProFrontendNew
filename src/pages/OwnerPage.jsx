import React, { useEffect, useState } from 'react';
import { turfApi } from '../api/turfApi';
import { bookingApi } from '../api/bookingApi';
import { timeSlotApi } from '../api/timeSlotApi';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/booking/BookingCard';
import './AdminPage.css'; // Reusing the same CSS for consistent styling

const SPORT_TYPES = ['CRICKET', 'FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS'];
// Removed 'Users' tab
const TABS = ['Dashboard', 'My Turfs', 'Bookings', 'Slots'];

const EMPTY_TURF = {
  turfName: '', location: '', address: '', areaInMetres: '',
  pricePerHour: '', sportType: 'CRICKET', openTime: '06:00', closeTime: '22:00',
  description: '', imageUrl: '' 
};

const OwnerPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [turfForm, setTurfForm] = useState(EMPTY_TURF);
  const [addingTurf, setAddingTurf] = useState(false);
  const [showTurfForm, setShowTurfForm] = useState(false);
  const [turfFormError, setTurfFormError] = useState('');
  const [turfFormSuccess, setTurfFormSuccess] = useState('');
  const [slotForm, setSlotForm] = useState({ turfId: '', date: '' });
  const [slotMsg, setSlotMsg] = useState('');
  const [generatingSlots, setGeneratingSlots] = useState(false);

  useEffect(() => { loadAll(); }, [user]);

  const loadAll = async () => {
    // Make sure we have a user ID before loading
    const currentUserId = user?.userId || user?.id;
    if (!currentUserId) return;

    setLoading(true);
    try {
      const [t, b] = await Promise.all([
        turfApi.getAllTurfs(),
        bookingApi.getAllBookings(),
      ]);

      // 1. FILTER TURFS: Only keep turfs created by THIS owner
      const allTurfs = Array.isArray(t.data) ? t.data : [];
      const myTurfs = allTurfs.filter(turf => String(turf.adminId) === String(currentUserId));
      setTurfs(myTurfs);

      // 2. FILTER BOOKINGS: Only keep bookings that match the names of the owner's turfs
      const myTurfNames = myTurfs.map(turf => turf.turfName);
      const allBookings = Array.isArray(b.data) ? b.data : [];
      const myBookings = allBookings.filter(booking => myTurfNames.includes(booking.turfName));
      setBookings(myBookings);

    } catch (e) {
      console.error('Failed to load owner data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTurfChange = e => {
    setTurfForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setTurfFormError('');
  };

  const handleAddTurf = async (e) => {
    e.preventDefault();
    if (!turfForm.turfName || !turfForm.location || !turfForm.pricePerHour) {
      setTurfFormError('Turf name, location and price are required.');
      return;
    }
    setAddingTurf(true);
    setTurfFormError('');
    try {
      await turfApi.addTurf({
        ...turfForm,
        areaInMetres: parseFloat(turfForm.areaInMetres) || 0,
        pricePerHour: parseFloat(turfForm.pricePerHour) || 0,
        adminId: user?.userId || user?.id, 
      });
      setTurfFormSuccess('Turf added successfully!');
      setTurfForm(EMPTY_TURF);
      setShowTurfForm(false);
      loadAll();
      setTimeout(() => setTurfFormSuccess(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to add turf.';
      setTurfFormError(typeof msg === 'string' ? msg : 'Failed to add turf.');
    } finally {
      setAddingTurf(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(id);
      loadAll();
    } catch (e) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Permanently delete this booking? This cannot be undone.')) return;
    try {
      await bookingApi.deleteBooking(id);
      loadAll();
    } catch (e) {
      alert('Failed to delete booking. Please try again.');
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    setSlotMsg('');
    if (!slotForm.turfId || !slotForm.date) {
      setSlotMsg('❌ Please select both a turf and a date');
      return;
    }
    setGeneratingSlots(true);
    try {
      const turf = turfs.find(t => String(t.turfId) === String(slotForm.turfId));
      if (!turf) { setSlotMsg('❌ Turf not found'); setGeneratingSlots(false); return; }
      
      await timeSlotApi.generateSlots({
        turfId: parseInt(slotForm.turfId),
        date: slotForm.date,
        startTime: turf.openTime,
        endTime: turf.closeTime,
      });
      setSlotMsg(`✅ Slots generated successfully for ${slotForm.date}! Users can now book ${turf.turfName}.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Server error';
      setSlotMsg('❌ ' + (typeof msg === 'string' ? msg : 'Server error'));
    } finally {
      setGeneratingSlots(false);
    }
  };

  const stats = {
    turfs: turfs.length,
    bookings: bookings.length,
    revenue: bookings
      .filter(b => (b.status || b.bookingStatus || 'CONFIRMED') !== 'CANCELLED')
      .reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div className="section-eyebrow">🏢 Owner Panel</div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Welcome, {user?.name}. Manage your turfs.</p>
        </div>

        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`admin-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Dashboard' ? '📊' :
               tab === 'My Turfs'  ? '🏟️' :
               tab === 'Bookings'  ? '📅' : '⏰'}{' '}{tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="spinner-overlay">
            <div className="spinner" />
            <span>Loading your data...</span>
          </div>
        )}

        {/* ── Dashboard Tab ── */}
        {!loading && activeTab === 'Dashboard' && (
          <div>
            <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div className="admin-stat-card admin-stat-card--green">
                <div className="admin-stat-card__icon">🏟️</div>
                <div>
                  <div className="admin-stat-card__val">{stats.turfs}</div>
                  <div className="admin-stat-card__label">My Turfs</div>
                </div>
              </div>
              <div className="admin-stat-card admin-stat-card--blue">
                <div className="admin-stat-card__icon">📅</div>
                <div>
                  <div className="admin-stat-card__val">{stats.bookings}</div>
                  <div className="admin-stat-card__label">Total Bookings</div>
                </div>
              </div>
              <div className="admin-stat-card admin-stat-card--purple">
                <div className="admin-stat-card__icon">💰</div>
                <div>
                  <div className="admin-stat-card__val">₹{stats.revenue.toLocaleString('en-IN')}</div>
                  <div className="admin-stat-card__label">Total Revenue</div>
                </div>
              </div>
            </div>

            <div className="admin-recent">
              <h3>Recent Bookings for My Turfs</h3>
              <div className="admin-bookings-list">
                {bookings.slice(0, 5).map(b => (
                  <BookingCard
                    key={b.bookingId}
                    booking={b}
                    isAdmin
                    onCancel={handleCancelBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
                {bookings.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <h3>No bookings yet</h3>
                    <p>Bookings for your turfs will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── My Turfs Tab ── */}
        {!loading && activeTab === 'My Turfs' && (
          <div>
            <div className="admin-section-header">
              <h2>My Turfs ({turfs.length})</h2>
              <button
                className="btn btn-primary"
                onClick={() => { setShowTurfForm(!showTurfForm); setTurfFormError(''); }}
              >
                {showTurfForm ? '✕ Cancel' : '+ Add New Turf'}
              </button>
            </div>

            {turfFormSuccess && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                ✅ {turfFormSuccess}
              </div>
            )}

            {showTurfForm && (
              <div className="admin-form-card">
                <h3>Add New Turf</h3>
                {turfFormError && (
                  <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    ⚠️ {turfFormError}
                  </div>
                )}
                <form onSubmit={handleAddTurf} className="admin-turf-form">
                  <div className="form-group">
                    <label className="form-label">Image URL (Optional)</label>
                    <input type="text" name="imageUrl" className="form-input"
                      placeholder="https://example.com/image.jpg" 
                      value={turfForm.imageUrl} 
                      onChange={handleTurfChange} 
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group">
                      <label className="form-label">Turf Name *</label>
                      <input type="text" name="turfName" className="form-input"
                        placeholder="Green Arena" value={turfForm.turfName} onChange={handleTurfChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sport Type *</label>
                      <select name="sportType" className="form-select"
                        value={turfForm.sportType} onChange={handleTurfChange}>
                        {SPORT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group">
                      <label className="form-label">Location *</label>
                      <input type="text" name="location" className="form-input"
                        placeholder="Pune, Maharashtra" value={turfForm.location} onChange={handleTurfChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Address</label>
                      <input type="text" name="address" className="form-input"
                        placeholder="123, Baner Road, Pune" value={turfForm.address} onChange={handleTurfChange} />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group">
                      <label className="form-label">Area (m²)</label>
                      <input type="number" name="areaInMetres" className="form-input"
                        placeholder="400" value={turfForm.areaInMetres} onChange={handleTurfChange} min="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price Per Hour (₹) *</label>
                      <input type="number" name="pricePerHour" className="form-input"
                        placeholder="800" value={turfForm.pricePerHour} onChange={handleTurfChange} min="0" />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group">
                      <label className="form-label">Open Time</label>
                      <input type="time" name="openTime" className="form-input"
                        value={turfForm.openTime} onChange={handleTurfChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Close Time</label>
                      <input type="time" name="closeTime" className="form-input"
                        value={turfForm.closeTime} onChange={handleTurfChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea name="description" className="form-input" rows={3}
                      placeholder="Describe the turf facilities, surface type, amenities..."
                      value={turfForm.description} onChange={handleTurfChange}
                      style={{ resize: 'vertical' }} />
                  </div>
                  <div>
                    <button type="submit" className="btn btn-primary" disabled={addingTurf}>
                      {addingTurf
                        ? <><span className="btn-spinner" /> Adding turf...</>
                        : '+ Add Turf'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="admin-turfs-grid">
              {turfs.map(turf => (
                <div key={turf.turfId} className="admin-turf-card">
                  <div className="admin-turf-card__header">
                    <span className="admin-turf-card__icon">
                      {turf.sportType === 'CRICKET'    ? '🏏' :
                       turf.sportType === 'BADMINTON'  ? '🏸' :
                       turf.sportType === 'BASKETBALL' ? '🏀' :
                       turf.sportType === 'TENNIS'     ? '🎾' : '⚽'}
                    </span>
                    <span className="badge badge-green">{turf.sportType}</span>
                  </div>
                  <h3>{turf.turfName}</h3>
                  <p>📍 {turf.location}</p>
                  <p>💰 ₹{turf.pricePerHour}/hr</p>
                  <p>📐 {turf.areaInMetres} m²</p>
                  {turf.openTime && turf.closeTime && (
                    <p>⏰ {turf.openTime} – {turf.closeTime}</p>
                  )}
                  <div className="admin-turf-card__id">ID: #{turf.turfId}</div>
                </div>
              ))}
              {turfs.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🏟️</div>
                  <h3>No turfs yet</h3>
                  <p>Click "Add New Turf" above to create your first turf.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {!loading && activeTab === 'Bookings' && (
          <div>
            <div className="admin-section-header">
              <h2>Bookings for My Turfs ({bookings.length})</h2>
              <button className="btn btn-secondary btn-sm" onClick={loadAll}>↻ Refresh</button>
            </div>
            <div className="admin-bookings-list">
              {bookings.map(b => (
                <BookingCard
                  key={b.bookingId}
                  booking={b}
                  isAdmin
                  onCancel={handleCancelBooking}
                  onDelete={handleDeleteBooking}
                />
              ))}
              {bookings.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>No bookings yet</h3>
                  <p>Bookings for your turfs will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Slots Tab ── */}
        {!loading && activeTab === 'Slots' && (
          <div>
            <div className="admin-section-header">
              <h2>Generate Time Slots</h2>
            </div>
            <div className="admin-form-card">
              <p style={{ fontSize: 14, color: 'var(--slate-500)', marginBottom: 20, lineHeight: 1.7 }}>
                Generate 1-hour booking slots for your specific turf and date.
                Slots are created based on the turf's open and close times.
                <strong style={{ color: 'var(--slate-700)' }}> Users can only book turfs that have slots generated for that date.</strong>
              </p>

              {slotMsg && (
                <div
                  className={`alert ${slotMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
                  style={{ marginBottom: 20 }}
                >
                  {slotMsg}
                </div>
              )}

              <form onSubmit={handleGenerateSlots}>
                <div className="admin-form-row" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Turf *</label>
                    <select
                      className="form-select"
                      value={slotForm.turfId}
                      onChange={e => { setSlotForm(p => ({ ...p, turfId: e.target.value })); setSlotMsg(''); }}
                      required
                    >
                      <option value="">-- Choose your turf --</option>
                      {/* Only maps through THIS owner's turfs */}
                      {turfs.map(t => (
                        <option key={t.turfId} value={t.turfId}>
                          {t.turfName} ({t.sportType}) — {t.openTime} to {t.closeTime}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={slotForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setSlotForm(p => ({ ...p, date: e.target.value })); setSlotMsg(''); }}
                      required
                    />
                  </div>
                </div>

                {slotForm.turfId && slotForm.date && (() => {
                  const t = turfs.find(t => String(t.turfId) === String(slotForm.turfId));
                  if (!t || !t.openTime || !t.closeTime) return null;
                  const start = parseInt(t.openTime.split(':')[0]);
                  const end   = parseInt(t.closeTime.split(':')[0]);
                  const count = end - start;
                  return (
                    <div className="alert alert-info" style={{ marginBottom: 20 }}>
                      📋 Preview: <strong>{count} slot{count !== 1 ? 's' : ''}</strong> will be generated for <strong>{t.turfName}</strong> on <strong>{slotForm.date}</strong> ({t.openTime} – {t.closeTime})
                    </div>
                  );
                })()}

                <button type="submit" className="btn btn-primary" disabled={generatingSlots}>
                  {generatingSlots
                    ? <><span className="btn-spinner" /> Generating slots...</>
                    : '⚡ Generate Slots'}
                </button>
              </form>
            </div>

            {turfs.length === 0 && (
              <div className="alert alert-info">
                ℹ️ No turfs found. Go to the <strong>My Turfs</strong> tab and add a turf first.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPage;