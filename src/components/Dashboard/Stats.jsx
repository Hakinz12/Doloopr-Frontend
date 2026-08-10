import React from 'react';

const Stats = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status !== 'completed').length;
    const overdue = tasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date();
    }).length;

    const stats = [
        { label: 'Total', value: total, primary: true },
        { label: 'Pending', value: pending },
        { label: 'Completed', value: completed },
        { label: 'Overdue', value: overdue },
    ];

    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.primary ? 'primary' : ''}`}>
                    <div className="number">{stat.value}</div>
                    <div className="label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

export default Stats;