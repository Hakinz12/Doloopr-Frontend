import React, { useState } from 'react';

const CalendarView = ({ tasks, onAddTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskTime, setNewTaskTime] = useState('12:00');
    const [showJumpInput, setShowJumpInput] = useState(false);
    const [jumpDate, setJumpDate] = useState('');
    const [jumpError, setJumpError] = useState('');

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        return { firstDay, daysInMonth, daysInPrevMonth };
    };

    const getTasksForDay = (day, month, year) => {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.due_date && task.due_date.split('T')[0] === dateStr);
    };

    const isPastDay = (day, month, year) => {
        const today = new Date();
        const date = new Date(year, month, day);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDayClick = (day, month, year) => {
        if (isPastDay(day, month, year)) return;

        const date = new Date(year, month, day);
        setSelectedDate(date);
        setShowTaskForm(true);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskTime('12:00');
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        const dateTimeStr = `${dateStr}T${newTaskTime}:00`;
        
        onAddTask({
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            priority: newTaskPriority,
            due_date: dateTimeStr,
            status: 'pending',
            progress: 0,
        });
        setShowTaskForm(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
    };

    const handleJumpToDate = () => {
        if (!jumpDate) {
            setJumpError('Please select a date');
            return;
        }
        const date = new Date(jumpDate);
        if (isNaN(date.getTime())) {
            setJumpError('Invalid date format');
            return;
        }
        setJumpError('');
        setCurrentDate(date);
        setJumpDate('');
        setShowJumpInput(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJumpToDate();
        }
        if (e.key === 'Escape') {
            setShowJumpInput(false);
            setJumpDate('');
            setJumpError('');
        }
    };

    const toggleJumpInput = () => {
        setShowJumpInput(!showJumpInput);
        if (!showJumpInput) {
            setJumpDate('');
            setJumpError('');
        }
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const buildMonthGrid = (year, month) => {
        const { firstDay, daysInMonth, daysInPrevMonth } = getDaysInMonth(new Date(year, month, 1));
        const days = [];
        const today = new Date();

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push({
                day,
                isOtherMonth: true,
                tasks: getTasksForDay(day, month - 1, year),
                isPast: isPastDay(day, month - 1, year),
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = 
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
            days.push({
                day,
                isOtherMonth: false,
                isToday,
                tasks: getTasksForDay(day, month, year),
                isPast: isPastDay(day, month, year),
            });
        }

        const remainingSlots = 42 - days.length;
        for (let day = 1; day <= remainingSlots; day++) {
            days.push({
                day,
                isOtherMonth: true,
                tasks: getTasksForDay(day, month + 1, year),
                isPast: isPastDay(day, month + 1, year),
            });
        }

        return days;
    };

    const getMonthsToDisplay = () => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const months = [];
        
        for (let i = -1; i <= 1; i++) {
            const month = currentMonth + i;
            const year = currentYear + Math.floor(month / 12);
            const adjustedMonth = ((month % 12) + 12) % 12;
            months.push({
                year,
                month: adjustedMonth,
                label: new Date(year, adjustedMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
            });
        }
        
        return months;
    };

    const months = getMonthsToDisplay();

    return (
        <div className="calendar-view">
            {/* Calendar Header */}
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button className="nav-btn" onClick={prevMonth}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="calendar-title">
                        {months.map((m, i) => (
                            <span key={i} className={`month-title ${i === 1 ? 'active' : ''}`}>
                                {m.label}
                            </span>
                        ))}
                    </span>
                    <button className="nav-btn" onClick={nextMonth}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className="calendar-header-actions">
                    <button className="today-btn" onClick={goToToday}>
                        <i className="fas fa-calendar-day"></i> Today
                    </button>
                    <button 
                        className={`jump-btn ${showJumpInput ? 'active' : ''}`} 
                        onClick={toggleJumpInput}
                    >
                        <i className="fas fa-calendar-plus"></i> Jump
                    </button>
                </div>
            </div>

            {/* Jump to Date Input - Furnished */}
            {showJumpInput && (
                <div className="jump-date-container">
                    <div className="jump-date-header">
                        <span className="jump-date-title">
                            <i className="fas fa-rocket"></i> Jump to Date
                        </span>
                        <button 
                            className="jump-close-btn" 
                            onClick={() => {
                                setShowJumpInput(false);
                                setJumpDate('');
                                setJumpError('');
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="jump-date-body">
                        <div className="jump-date-input-wrapper">
                            <i className="fas fa-calendar-alt jump-input-icon"></i>
                            <input
                                type="date"
                                className="jump-date-input"
                                value={jumpDate}
                                onChange={(e) => {
                                    setJumpDate(e.target.value);
                                    setJumpError('');
                                }}
                                onKeyDown={handleKeyPress}
                                placeholder="YYYY-MM-DD"
                                autoFocus
                            />
                        </div>
                        {jumpError && (
                            <div className="jump-date-error">
                                <i className="fas fa-exclamation-circle"></i> {jumpError}
                            </div>
                        )}
                        <div className="jump-date-actions">
                            <button className="jump-cancel-btn" onClick={() => {
                                setShowJumpInput(false);
                                setJumpDate('');
                                setJumpError('');
                            }}>
                                Cancel
                            </button>
                            <button className="jump-go-btn" onClick={handleJumpToDate}>
                                <i className="fas fa-arrow-right"></i> Go
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Month Grids */}
            <div className="calendar-grid-container">
                {months.map((monthData, index) => {
                    const days = buildMonthGrid(monthData.year, monthData.month);
                    const isCurrent = index === 1;
                    
                    return (
                        <div key={index} className={`month-grid ${isCurrent ? 'current-month' : 'side-month'}`}>
                            <div className="month-label">
                                {new Date(monthData.year, monthData.month, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="calendar-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="calendar-day-header">{day}</div>
                                ))}
                                
                                {days.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`calendar-day 
                                            ${item.isOtherMonth ? 'other-month' : ''} 
                                            ${item.isToday ? 'today' : ''}
                                            ${item.tasks.length > 0 ? 'has-tasks' : ''}
                                            ${item.isPast ? 'past-day' : ''}
                                        `}
                                        onClick={() => {
                                            if (!item.isPast) {
                                                handleDayClick(item.day, 
                                                    item.isOtherMonth && item.day > 15 
                                                        ? monthData.month - 1 
                                                        : item.isOtherMonth && item.day <= 15 
                                                        ? monthData.month + 1 
                                                        : monthData.month,
                                                    item.isOtherMonth && item.day > 15 
                                                        ? monthData.year 
                                                        : item.isOtherMonth && item.day <= 15 
                                                        ? monthData.year 
                                                        : monthData.year
                                                );
                                            }
                                        }}
                                    >
                                        <div className="day-number">{item.day}</div>
                                        {item.tasks.length > 0 && (
                                            <div className="day-task-indicators">
                                                {item.tasks.slice(0, 2).map(task => (
                                                    <div key={task.id} className={`day-task-dot ${task.status === 'completed' ? 'completed' : ''}`} />
                                                ))}
                                                {item.tasks.length > 2 && (
                                                    <span className="day-more">+{item.tasks.length - 2}</span>
                                                )}
                                            </div>
                                        )}
                                        {item.isPast && (
                                            <div className="day-past-overlay">
                                                <i className="fas fa-lock"></i>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Task Modal */}
            {showTaskForm && (
                <div className="calendar-task-modal-overlay" onClick={() => setShowTaskForm(false)}>
                    <div className="calendar-task-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-plus-circle"></i> 
                                Add Task for {selectedDate?.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </h3>
                            <button className="modal-close" onClick={() => setShowTaskForm(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Task Title <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Add details..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                    >
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🟠 High</option>
                                        <option value="critical">🔴 Critical</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={newTaskTime}
                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="text"
                                    value={selectedDate?.toLocaleDateString('en-US', { 
                                        weekday: 'long',
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                    disabled
                                    className="date-display"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowTaskForm(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn-add" 
                                onClick={handleAddTask} 
                                disabled={!newTaskTitle.trim()}
                            >
                                <i className="fas fa-plus"></i> Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;