import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../../utils/api';
import { setAuthToken } from '../../utils/api';
import useAlarm from '../../hooks/useAlarm';
import AlarmBar from '../Alarm/AlarmBar';
import TaskList from './TaskList';
import AddTask from './AddTask';
import Stats from './Stats';
import Insights from './Insights';
import CalendarView from './CalendarView';
import FeedbackButton from '../Layout/FeedbackButton';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    
    const alarm = useAlarm();

    useEffect(() => {
        if (user) {
            setAuthToken(user.access_token);
            loadTasks();
            alarm.requestNotificationPermission();
        }
    }, [user]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const response = await getTasks();
            if (response.success) {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
        setLoading(false);
    };

    // Check for due tasks every 30 seconds
    useEffect(() => {
        if (tasks.length === 0) return;
        
        const checkInterval = setInterval(() => {
            const due = alarm.checkDueTasks(tasks);
            if (due.length > 0 && !alarm.alarmActive) {
                alarm.triggerAlarm(due);
            }
        }, 30000);
        
        // Also check immediately
        const due = alarm.checkDueTasks(tasks);
        if (due.length > 0 && !alarm.alarmActive) {
            alarm.triggerAlarm(due);
        }
        
        return () => clearInterval(checkInterval);
    }, [tasks]);

    const handleAddTask = async (taskData) => {
        try {
            const response = await createTask(taskData);
            if (response.success) {
                setTasks([response.data, ...tasks]);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleUpdateTask = async (id, taskData) => {
        try {
            const response = await updateTask(id, taskData);
            if (response.success) {
                setTasks(tasks.map(t => t.id === id ? response.data : t));
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const response = await deleteTask(id);
            if (response.success) {
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status !== 'completed');

    return (
        <div className="dashboard">
            {/* Alarm Bar */}
            <AlarmBar
                alarmActive={alarm.alarmActive}
                dueTasks={alarm.dueTasks}
                isSnoozed={alarm.isSnoozed}
                onStop={alarm.stopAlarm}
                onSnooze={alarm.snoozeAlarm}
            />

            <header className="dashboard-header">
                <h1><i className="fas fa-tasks"></i>My Tasks</h1>
                <div className="header-actions">
                    <span className="user-name">👤 {user?.user_metadata?.name || user?.email}</span>
                    <button onClick={signOut} className="logout-btn">Logout</button>
                </div>
            </header>

            {/* Stats */}
            <Stats tasks={tasks} />

            {/* Insights */}
            <Insights tasks={tasks} />

            {/* View Controls */}
            <div className="view-controls">
                <button 
                    className={`view-btn ${view === 'list' ? 'active' : ''}`}
                    onClick={() => setView('list')}
                >
                    <i className="fas fa-list-ul"></i> List
                </button>
                <button 
                    className={`view-btn ${view === 'board' ? 'active' : ''}`}
                    onClick={() => setView('board')}
                >
                    <i className="fas fa-columns"></i> Board
                </button>
                <button 
                    className={`view-btn ${view === 'calendar' ? 'active' : ''}`}
                    onClick={() => setView('calendar')}
                >
                    <i className="fas fa-calendar-alt"></i> Calendar
                </button>
            </div>

            {/* Add Task Form */}
            <AddTask onAdd={handleAddTask} />

            {/* Views */}
            {loading ? (
                <p className="loading-text">Loading tasks...</p>
            ) : view === 'list' ? (
                <TaskList
                    tasks={pendingTasks}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            ) : view === 'board' ? (
                <div className="board-view">
                    {['pending', 'in-progress', 'completed'].map(status => {
                        const label = status === 'pending' ? '📋 To Do' : 
                                     status === 'in-progress' ? '🔄 In Progress' : '✅ Done';
                        const tasksInCol = tasks.filter(t => t.status === status);
                        return (
                            <div key={status} className="board-column">
                                <h3>{label}</h3>
                                <div className="board-tasks">
                                    {tasksInCol.length === 0 ? (
                                        <div className="empty-board">No tasks</div>
                                    ) : (
                                        tasksInCol.map(task => (
                                            <div key={task.id} className="task-item compact">
                                                <div className="task-content">
                                                    <div className="task-title">{task.title}</div>
                                                    <div className="task-meta">
                                                        <span className={`task-tag priority-${task.priority || 'medium'}`}>
                                                            {task.priority || 'Medium'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'completed'}
                                                    onChange={() => handleUpdateTask(task.id, {
                                                        status: task.status === 'completed' ? 'pending' : 'completed',
                                                        progress: task.status === 'completed' ? 0 : 100
                                                    })}
                                                    className="task-checkbox"
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <CalendarView tasks={tasks} onAddTask={handleAddTask} />
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
                <div className="completed-section">
                    <details>
                        <summary>
                            <i className="fas fa-check-circle"></i>
                            Completed Tasks ({completedTasks.length})
                        </summary>
                        <TaskList
                            tasks={completedTasks}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                        />
                    </details>
                </div>
            )}

            {/* Feedback Button */}
            <FeedbackButton />
        </div>
    );
};

export default Dashboard;