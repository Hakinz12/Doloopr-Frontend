import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>📧 Check Your Email</h1>
                    <p className="subtitle">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-muted">
                        Click the link in the email to reset your password. The link will expire in 1 hour.
                    </p>
                    <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🔐 Forgot Password</h1>
                <p className="subtitle">
                    Enter your email address and we'll send you a reset link.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-switch" style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                        ← Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;