import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No reset token provided');
            setValidating(false);
            return;
        }

        // Verify token
        api.get('/auth/verify-reset-token', { params: { token } })
            .then((response) => {
                if (response.data.success && response.data.valid) {
                    setTokenValid(true);
                } else {
                    setError('Invalid or expired reset token');
                }
                setValidating(false);
            })
            .catch(() => {
                setError('Invalid or expired reset token');
                setValidating(false);
            });
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: password
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>🔄 Validating...</h1>
                    <p className="subtitle">Please wait while we verify your reset link.</p>
                </div>
            </div>
        );
    }

    if (error && !tokenValid) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>❌ Invalid Link</h1>
                    <p className="subtitle">{error}</p>
                    <Link to="/forgot-password" className="auth-btn" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>✅ Password Reset!</h1>
                    <p className="subtitle">Your password has been successfully reset.</p>
                    <p className="text-muted" style={{ marginBottom: '16px' }}>Redirecting to login...</p>
                    <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🔐 Reset Password</h1>
                <p className="subtitle">Enter your new password below.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Min 8 characters"
                            minLength="8"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;