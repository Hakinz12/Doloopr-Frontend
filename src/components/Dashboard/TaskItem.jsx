import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task);

    const handleComplete = () => {
        onUpdate(task.id, {
            ...task,
            status: task.status === 'completed' ? 'pending' : 'completed',
            progress: task.status === 'completed' ? 0 : 100,
        });
    };

    const handleSave = () => {
        onUpdate(task.id, editedTask);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="task-item editing">
                <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    placeholder="Title"
                />
                <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    placeholder="Description"
                />
                <select
                    value={editedTask.priority || 'medium'}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
                <div className="task-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={handleComplete}
                className="task-checkbox"
            />
            <div className="task-content">
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-desc">{task.description}</div>}
                <div className="task-meta">
                    <span className={`task-tag priority-${task.priority || 'medium'}`}>
                        {task.priority || 'Medium'}
                    </span>
                    <span className="task-tag status">{task.status}</span>
                    {task.due_date && (
                        <span className="task-tag due">
                            📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
            <div className="task-actions-right">
                <button onClick={() => setIsEditing(true)} className="edit-btn">✏️</button>
                <button onClick={() => onDelete(task.id)} className="delete-btn">🗑️</button>
            </div>
        </div>
        
    );
// Add after task-meta
{task.progress !== undefined && task.status !== 'completed' && (
    <div className="task-progress">
        <div className="progress-bar">
            <div className="fill" style={{ width: `${task.progress || 0}%` }}></div>
        </div>
        <span className="progress-text">{task.progress || 0}%</span>
    </div>
)}
// Add after priority tag
{task.due_date && (
    <span className={`task-tag due ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'overdue' : ''}`}>
        📅 {new Date(task.due_date).toLocaleDateString()}
        {new Date(task.due_date) < new Date() && task.status !== 'completed' && ' ⚠️'}
    </span>
)}
// Add after description
{task.subtasks && task.subtasks.length > 0 && (
    <div className="subtasks">
        {task.subtasks.map((subtask, index) => (
            <div key={index} className="subtask-item">
                <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => {
                        const updatedSubtasks = [...task.subtasks];
                        updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
                        onUpdate(task.id, { subtasks: updatedSubtasks });
                    }}
                />
                <span className={subtask.completed ? 'completed' : ''}>{subtask.title}</span>
            </div>
        ))}
    </div>
)}
};

export default TaskItem;