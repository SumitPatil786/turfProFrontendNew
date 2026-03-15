import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
const navigate = useNavigate();

return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '500px', width: '90%' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
        <h1 style={{ color: 'var(--slate-900)', marginBottom: '8px' }}>Payment Cancelled</h1>
        <p style={{ color: 'var(--slate-500)', marginBottom: '32px', lineHeight: '1.6' }}>
        Your payment was not completed and your booking has not been confirmed. 
        </p>
        
        <button 
        className="btn btn-primary" 
        onClick={() => navigate('/turfs')}
        >
        ← Back to Turfs
        </button>
    </div>
    </div>
);
};

export default PaymentFailed;