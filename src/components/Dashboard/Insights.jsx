import React from 'react';

const Insights = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date();
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const insights = [];

    if (total === 0) {
        insights.push('📝 Start adding tasks to track your productivity!');
    } else if (completionRate >= 80) {
        insights.push('🔥 Outstanding! You\'ve completed ' + completionRate + '% of your tasks.');
    } else if (completionRate >= 50) {
        insights.push('💪 Good progress! You\'ve completed ' + completionRate + '% of your tasks.');
    } else {
        insights.push('📋 Focus! Only ' + completionRate + '% of tasks completed.');
    }

    if (overdue > 0) {
        insights.push('⚠️ ' + overdue + ' overdue task' + (overdue > 1 ? 's' : '') + ' – tackle these first!');
    }

    return (
        <div className="insights-panel">
            <div className="insights-header">
                <h3><i className="fas fa-brain"></i> Productivity Insights</h3>
                <span className="score">{completionRate}%</span>
            </div>
            <div className="insights-list">
                {insights.map((insight, index) => (
                    <div key={index}>{insight}</div>
                ))}
            </div>
        </div>
    );
};

export default Insights;