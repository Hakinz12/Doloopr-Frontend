import { useState, useEffect, useRef } from 'react';

export const useAlarm = () => {
    const [alarmActive, setAlarmActive] = useState(false);
    const [alarmEnabled, setAlarmEnabled] = useState(true);
    const [alarmSound, setAlarmSound] = useState('beep');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [repeatInterval, setRepeatInterval] = useState(60);
    const [isSnoozed, setIsSnoozed] = useState(false);
    const [dueTasks, setDueTasks] = useState([]);
    
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const intervalRef = useRef(null);
    const countdownRef = useRef(null);
    const snoozeTimeoutRef = useRef(null);

    const playSound = () => {
        if (!soundEnabled || !alarmEnabled) return;
        
        try {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            switch (alarmSound) {
                case 'bell':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 880;
                    break;
                case 'buzzer':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.value = 440;
                    break;
                case 'silent':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 0;
                    gainNode.gain.value = 0;
                    break;
                default: // beep
                    oscillator.type = 'square';
                    oscillator.frequency.value = 880;
                    break;
            }
            
            if (alarmSound !== 'silent') {
                gainNode.gain.value = 0.3;
                oscillator.start();
            } else {
                oscillator.start();
                gainNode.gain.value = 0;
            }
            
            oscillatorRef.current = oscillator;
            
            let toggle = true;
            intervalRef.current = setInterval(() => {
                if (!alarmEnabled || isSnoozed) {
                    clearInterval(intervalRef.current);
                    return;
                }
                if (alarmSound !== 'silent' && soundEnabled) {
                    toggle = !toggle;
                    if (toggle) {
                        oscillator.start();
                    } else {
                        oscillator.stop();
                    }
                }
            }, 400);
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    };

    const stopSound = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
            } catch (e) {}
            oscillatorRef.current = null;
        }
        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch (e) {}
            audioContextRef.current = null;
        }
    };

    const triggerAlarm = (tasks) => {
        if (!alarmEnabled) return;
        
        setAlarmActive(true);
        setDueTasks(tasks);
        setIsSnoozed(false);
        
        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200, 100, 500]);
            const vibrationInterval = setInterval(() => {
                if (alarmActive && alarmEnabled && !isSnoozed) {
                    navigator.vibrate([200, 100, 200, 100, 200]);
                }
            }, 5000);
            // Store interval for cleanup
            window._vibrationInterval = vibrationInterval;
        }
        
        // Play sound
        playSound();
        
        // Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            tasks.forEach(task => {
                new Notification('⏰ Task Due!', {
                    body: `"${task.title}" is due now!`,
                    icon: '/favicon.ico',
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                });
            });
        }
        
        // Start countdown for repeat
        startCountdown();
    };

    const startCountdown = () => {
        let seconds = repeatInterval;
        updateCountdownDisplay(seconds);
        
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        
        countdownRef.current = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                if (alarmActive && alarmEnabled && !isSnoozed) {
                    // Repeat alarm
                    playSound();
                    if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200, 100, 200, 100, 500]);
                    }
                    if ('Notification' in window && Notification.permission === 'granted') {
                        dueTasks.forEach(task => {
                            new Notification('⏰ Task Still Due!', {
                                body: `"${task.title}" is still pending!`,
                                icon: '/favicon.ico',
                                requireInteraction: true,
                                vibrate: [200, 100, 200]
                            });
                        });
                    }
                    seconds = repeatInterval;
                } else {
                    clearInterval(countdownRef.current);
                    countdownRef.current = null;
                    return;
                }
            }
            updateCountdownDisplay(seconds);
        }, 1000);
    };

    const updateCountdownDisplay = (seconds) => {
        const countdownEl = document.getElementById('alarmCountdown');
        if (countdownEl) {
            if (seconds < 60) {
                countdownEl.textContent = `🔁 Repeats in: ${seconds}s`;
            } else if (seconds < 3600) {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                countdownEl.textContent = `🔁 Repeats in: ${mins}m ${secs}s`;
            } else {
                const hrs = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                countdownEl.textContent = `🔁 Repeats in: ${hrs}h ${mins}m`;
            }
        }
    };

    const snoozeAlarm = (minutes = 5) => {
        setIsSnoozed(true);
        stopSound();
        
        if (window._vibrationInterval) {
            clearInterval(window._vibrationInterval);
            window._vibrationInterval = null;
            if (navigator.vibrate) navigator.vibrate(0);
        }
        
        if (snoozeTimeoutRef.current) {
            clearTimeout(snoozeTimeoutRef.current);
        }
        
        const countdownEl = document.getElementById('alarmCountdown');
        if (countdownEl) {
            countdownEl.textContent = `😴 Snoozed for ${minutes}m`;
        }
        
        snoozeTimeoutRef.current = setTimeout(() => {
            if (alarmActive && alarmEnabled) {
                setIsSnoozed(false);
                if (dueTasks.length > 0) {
                    triggerAlarm(dueTasks);
                }
            }
            snoozeTimeoutRef.current = null;
        }, minutes * 60000);
        
        return minutes;
    };

    const stopAlarm = () => {
        setAlarmActive(false);
        setIsSnoozed(false);
        setDueTasks([]);
        stopSound();
        
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        if (snoozeTimeoutRef.current) {
            clearTimeout(snoozeTimeoutRef.current);
            snoozeTimeoutRef.current = null;
        }
        if (window._vibrationInterval) {
            clearInterval(window._vibrationInterval);
            window._vibrationInterval = null;
            if (navigator.vibrate) navigator.vibrate(0);
        }
    };

    const checkDueTasks = (tasks) => {
        if (!alarmEnabled) return [];
        
        const now = new Date();
        const due = tasks.filter(task => {
            if (task.status === 'completed' || task.status === 'cancelled') return false;
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            return dueDate <= now;
        });
        
        return due;
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSound();
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
            if (snoozeTimeoutRef.current) {
                clearTimeout(snoozeTimeoutRef.current);
            }
            if (window._vibrationInterval) {
                clearInterval(window._vibrationInterval);
            }
        };
    }, []);

    return {
        alarmActive,
        alarmEnabled,
        setAlarmEnabled,
        alarmSound,
        setAlarmSound,
        soundEnabled,
        setSoundEnabled,
        repeatInterval,
        setRepeatInterval,
        isSnoozed,
        dueTasks,
        triggerAlarm,
        stopAlarm,
        snoozeAlarm,
        checkDueTasks,
        requestNotificationPermission,
        playSound,
        stopSound,
    };
};

export default useAlarm;