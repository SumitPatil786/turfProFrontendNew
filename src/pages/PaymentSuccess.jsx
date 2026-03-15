import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
const navigate = useNavigate();

return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px', width: '90%' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ color: 'var(--slate-900)', marginBottom: '8px' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--slate-500)', marginBottom: '32px', lineHeight: '1.6' }}>
        Your turf booking has been confirmed. Get your gear ready and have a great game!
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/turfs')}
        >
            Book Another
        </button>
        <button 
            className="btn btn-primary" 
            onClick={() => navigate('/my-bookings')}
        >
            View My Bookings →
        </button>
        </div>
    </div>
    </div>
);
};

export default PaymentSuccess;