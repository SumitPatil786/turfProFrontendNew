import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import { timeSlotApi } from '../api/timeSlotApi';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import './TurfDetailPage.css';

const PAYMENT_METHODS = ['UPI', 'DEBITCARD', 'WALLET', 'STRIPE'];
const PAYMENT_ICONS = { UPI: '📲', DEBITCARD: '💳', WALLET: '👛', STRIPE: '🔒' };

const TurfDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  // Load turf details — try getTurfById first, fallback to getAll
  useEffect(() => {
    setLoading(true);
    turfApi.getTurfById(id)
      .then(res => setTurf(res.data))
      .catch(() =>
        turfApi.getAllTurfs()
          .then(res => {
            const found = res.data.find(t => String(t.turfId) === String(id));
            if (found) setTurf(found);
            else setError('Turf not found');
          })
          .catch(() => setError('Failed to load turf details'))
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate || !id) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    timeSlotApi.getSlots(id, selectedDate)
      .then(res => setSlots(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, id]);

  const formatTime = (t) => {
    if (!t) return '--';
    const [h, m] = t.toString().split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m || '00'} ${ampm}`;
  };

  const calcAmount = () => {
    if (!selectedSlot || !turf) return 0;
    const start = selectedSlot.startTime?.split(':');
    const end = selectedSlot.endTime?.split(':');
    if (!start || !end) return turf.pricePerHour || 0;
    const hours = Math.max(1, parseInt(end[0]) - parseInt(start[0]));
    return hours * (turf.pricePerHour || 0);
  };

const handleBooking = async () => {
// 👇 Add this temporarily so you can see your user object in the console
    console.log("Current Logged In User:", user); 

    if (!isLoggedIn || !user) { 
      navigate('/login', { state: { from: { pathname: `/turfs/${id}` } } }); 
      return; 
    }
    
    // 👇 CHECK BOTH .userId AND .id
    const currentUserId = user.userId || user.id;

    if (!currentUserId) {
      setError('User context error: Missing user ID. Please log in again.');
      return;
    }

    if (!selectedSlot || !selectedDate) { 
      setError('Please select a valid date and time slot.'); 
      return; 
    }

    if (!turf || !turf.turfId) {
      setError('Invalid turf details. Please refresh the page.');
      return;
    }

    setBooking(true);
    setError('');
    
    try {
      const payload = {
        slotId: selectedSlot.slotId,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        totalAmount: calcAmount(),
        userId: currentUserId, // 👇 USE THE VARIABLE WE DEFINED ABOVE
        turfId: turf.turfId    
      };

      // Make the API call
      const response = await bookingApi.createBooking(payload);

      // 3. STRIPE PAYMENT ROUTING
      if (paymentMethod === 'STRIPE' && response.data?.paymentUrl) {
        // Redirect the window to the Stripe Checkout session
        window.location.href = response.data.paymentUrl;
        return; // Halt further execution while the browser redirects
      }

      // Fallback success if testing other methods (though your current backend forces Stripe for all)
      setSuccess('🎉 Booking confirmed! See you on the turf!');
      setStep(4);

    } catch (err) {
      const msg = err.response?.data?.message 
        || err.response?.data?.error 
        || (typeof err.response?.data === 'string' ? err.response.data : null) 
        || 'Booking failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (loading) return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <span>Loading turf details...</span>
    </div>
  );
  if (error && !turf) return (
    <div className="container page-wrapper">
      <div className="alert alert-error">⚠️ {error}</div>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/turfs')}>
        ← Back to Turfs
      </button>
    </div>
  );

  return (
    <div className="turf-detail page-wrapper">
      <div className="container">
        {/* Back */}
        <button className="turf-detail__back" onClick={() => navigate('/turfs')}>
          ← Back to Turfs
        </button>

        {/* Step 4 - Success */}
        {step === 4 && (
          <div className="booking-success">
            <div className="booking-success__icon">🎉</div>
            <h2>Booking Confirmed!</h2>
            <p>{success}</p>
            <div className="booking-success__details">
              <div><span>Turf</span><strong>{turf?.turfName}</strong></div>
              <div><span>Date</span><strong>{selectedDate}</strong></div>
              <div><span>Time</span><strong>{formatTime(selectedSlot?.startTime)} – {formatTime(selectedSlot?.endTime)}</strong></div>
              <div><span>Amount</span><strong>₹{calcAmount()}</strong></div>
              <div><span>Payment</span><strong>{PAYMENT_ICONS[paymentMethod]} {paymentMethod}</strong></div>
            </div>
            <div className="booking-success__actions">
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setSelectedSlot(null); setSelectedDate(''); setSuccess(''); }}>Book Again</button>
            </div>
          </div>
        )}

        {step !== 4 && (
          <div className="turf-detail__layout">
            {/* Left: Turf Info */}
            <div className="turf-detail__info">
              <div className="turf-detail__banner">
                <span className="turf-detail__banner-icon">
                  {turf?.sportType === 'CRICKET' ? '🏏' :
                  turf?.sportType === 'BADMINTON' ? '🏸' :
                  turf?.sportType === 'BASKETBALL' ? '🏀' :
                  turf?.sportType === 'TENNIS' ? '🎾' : '⚽'}
                </span>
              </div>
              <div className="turf-detail__card">
                <div className="turf-detail__card-header">
                  <span className="badge badge-green">{turf?.sportType}</span>
                  <h1 className="turf-detail__name">{turf?.turfName}</h1>
                </div>
                <div className="turf-detail__attrs">
                  <div className="turf-detail__attr">
                    <span className="turf-detail__attr-icon">📍</span>
                    <div><label>Location</label><span>{turf?.location}</span></div>
                  </div>
                  <div className="turf-detail__attr">
                    <span className="turf-detail__attr-icon">🏠</span>
                    <div><label>Address</label><span>{turf?.address || 'Not specified'}</span></div>
                  </div>
                  <div className="turf-detail__attr">
                    <span className="turf-detail__attr-icon">📐</span>
                    <div><label>Area</label><span>{turf?.areaInMetres} m²</span></div>
                  </div>
                  <div className="turf-detail__attr">
                    <span className="turf-detail__attr-icon">⏰</span>
                    <div><label>Hours</label><span>{formatTime(turf?.openTime)} – {formatTime(turf?.closeTime)}</span></div>
                  </div>
                  <div className="turf-detail__attr">
                    <span className="turf-detail__attr-icon">💰</span>
                    <div><label>Rate</label><span className="turf-detail__price">₹{turf?.pricePerHour}/hr</span></div>
                  </div>
                </div>
                {turf?.description && (
                  <p className="turf-detail__desc">{turf.description}</p>
                )}
              </div>
            </div>

            {/* Right: Booking Panel */}
            <div className="turf-detail__booking">
              {/* Step Indicator */}
              <div className="booking-steps">
                {['Date & Slot', 'Payment', 'Confirm'].map((s, i) => (
                  <div key={s} className={`booking-step${step >= i + 1 ? ' active' : ''}${step > i + 1 ? ' done' : ''}`}>
                    <div className="booking-step__num">{step > i + 1 ? '✓' : i + 1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* Step 1: Date & Slot */}
              {step === 1 && (
                <div className="booking-panel">
                  <h2 className="booking-panel__title">Select Date & Slot</h2>

                  <div className="form-group">
                    <label className="form-label">Booking Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={selectedDate}
                      min={today}
                      max={maxDateStr}
                      onChange={e => { setSelectedDate(e.target.value); setError(''); }}
                    />
                  </div>

                  {selectedDate && (
                    <div className="slots-section">
                      <label className="form-label">Available Time Slots</label>
                      {slotsLoading ? (
                        <div className="slots-loading"><div className="spinner" style={{ width: 28, height: 28 }} /><span>Loading slots...</span></div>
                      ) : slots.length === 0 ? (
                        <div className="slots-empty">
                          <p>⚠️ No slots available for this date</p>
                          <small>Try a different date or ask admin to generate slots</small>
                        </div>
                      ) : (
                        <div className="slots-grid">
                          {slots.map(slot => (
                            <button
                              key={slot.slotId}
                              className={`slot-btn${!slot.isAvailable ? ' slot-btn--booked' : ''}${selectedSlot?.slotId === slot.slotId ? ' slot-btn--selected' : ''}`}
                              onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                              disabled={!slot.isAvailable}
                            >
                              {formatTime(slot.startTime)}<br />
                              <small>{formatTime(slot.endTime)}</small>
                              {!slot.isAvailable && <span className="slot-taken">Taken</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}

                  {!isLoggedIn && (
                    <div className="booking-login-note">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login', { state: { from: { pathname: `/turfs/${id}` } } })}>
                        Login
                      </button> to complete your booking
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 20 }}
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => { setError(''); setStep(2); }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="booking-panel">
                  <h2 className="booking-panel__title">Payment Method</h2>
                  <div className="booking-summary">
                    <div className="booking-summary__row"><span>Turf</span><strong>{turf?.turfName}</strong></div>
                    <div className="booking-summary__row"><span>Date</span><strong>{selectedDate}</strong></div>
                    <div className="booking-summary__row"><span>Slot</span><strong>{formatTime(selectedSlot?.startTime)} – {formatTime(selectedSlot?.endTime)}</strong></div>
                    <div className="booking-summary__row booking-summary__row--total"><span>Total</span><strong>₹{calcAmount()}</strong></div>
                  </div>

                  <div className="payment-methods">
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm}
                        className={`payment-option${paymentMethod === pm ? ' selected' : ''}`}
                        onClick={() => setPaymentMethod(pm)}
                      >
                        <span>{PAYMENT_ICONS[pm]}</span>
                        <span>{pm}</span>
                        {paymentMethod === pm && <span className="payment-check">✓</span>}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="form-label">UPI ID</label>
                      <input type="text" className="form-input" placeholder="yourname@upi" />
                    </div>
                  )}
                  {paymentMethod === 'DEBITCARD' && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input type="text" className="form-input" placeholder="1234 5678 9012 3456" maxLength={19} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">Expiry</label>
                          <input type="text" className="form-input" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input type="password" className="form-input" placeholder="•••" maxLength={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
                      Review Booking →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="booking-panel">
                  <h2 className="booking-panel__title">Confirm Booking</h2>
                  <div className="booking-confirm-details">
                    <div><label>Turf</label><span>{turf?.turfName}</span></div>
                    <div><label>Sport</label><span>{turf?.sportType}</span></div>
                    <div><label>Location</label><span>{turf?.location}</span></div>
                    <div><label>Date</label><span>{selectedDate}</span></div>
                    <div><label>Time</label><span>{formatTime(selectedSlot?.startTime)} – {formatTime(selectedSlot?.endTime)}</span></div>
                    <div><label>Payment</label><span>{PAYMENT_ICONS[paymentMethod]} {paymentMethod}</span></div>
                    <div className="total-row"><label>Total Amount</label><span className="total-amount">₹{calcAmount()}</span></div>
                  </div>

                  {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleBooking}
                      disabled={booking}
                    >
                      {booking ? (
                        <><span className="btn-spinner" /> Processing...</>
                      ) : `✓ Confirm & Pay ₹${calcAmount()}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfDetailPage;
