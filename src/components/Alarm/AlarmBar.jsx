import React, { useState } from 'react';

const AlarmBar = ({ 
    alarmActive, 
    dueTasks, 
    isSnoozed, 
    onStop, 
    onSnooze 
}) => {
    const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

    if (!alarmActive || dueTasks.length === 0) return null;

    const titles = dueTasks.map(t => t.title).join(', ');

    return (
        <div className={`alarm-bar ${alarmActive ? 'active' : ''}`}>
            <div className="alarm-content">
                <span className="alarm-icon">🔔</span>
                <span className="alarm-text">
                    ⏰ Due: {titles}
                    {isSnoozed && ' (Snoozed)'}
                </span>
            </div>
            <div className="alarm-actions">
                <span id="alarmCountdown" className="alarm-countdown">🔁 Repeats in: --</span>
                <div className="alarm-buttons">
                    <button 
                        className="alarm-btn snooze-btn"
                        onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                    >
                        <i className="fas fa-clock"></i> Snooze
                    </button>
                    {showSnoozeOptions && (
                        <div className="snooze-dropdown">
                            <button onClick={() => { onSnooze(5); setShowSnoozeOptions(false); }}>5 min</button>
                            <button onClick={() => { onSnooze(10); setShowSnoozeOptions(false); }}>10 min</button>
                            <button onClick={() => { onSnooze(15); setShowSnoozeOptions(false); }}>15 min</button>
                            <button onClick={() => { onSnooze(30); setShowSnoozeOptions(false); }}>30 min</button>
                        </div>
                    )}
                    <button className="alarm-btn stop-btn" onClick={onStop}>
                        <i className="fas fa-stop"></i> Stop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlarmBar;