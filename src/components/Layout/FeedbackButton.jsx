import React, { useState } from 'react';
import { submitFeedback } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const FeedbackButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async () => {
        if (!message.trim() || message.length < 3) return;

        setLoading(true);
        try {
            const response = await submitFeedback(message);
            if (response.success) {
                setSubmitted(true);
                setMessage('');
                setTimeout(() => {
                    setIsOpen(false);
                    setSubmitted(false);
                }, 2000);
            }
        } catch (error) {
            alert('Failed to send feedback. Please try again.');
        }
        setLoading(false);
    };

    return (
        <>
            <button className="feedback-btn" onClick={() => setIsOpen(true)}>
                💬 Feedback
            </button>

            {isOpen && (
                <div className="feedback-overlay" onClick={() => setIsOpen(false)}>
                    <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>💬 Send Feedback</h3>
                        <p className="feedback-subtitle">Help us improve DoLoopr!</p>

                        {submitted ? (
                            <div className="feedback-success">✅ Thank you for your feedback!</div>
                        ) : (
                            <>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="What's on your mind?"
                                    rows={4}
                                    className="feedback-textarea"
                                    disabled={loading}
                                />
                                <div className="feedback-actions">
                                    <button className="feedback-cancel" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="feedback-submit"
                                        onClick={handleSubmit}
                                        disabled={loading || !message.trim()}
                                    >
                                        {loading ? 'Sending...' : 'Send Feedback'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackButton;