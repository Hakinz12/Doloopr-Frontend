// In your menu/dropdown
<div className="alarm-settings">
    <h4>🔔 Alarm Settings</h4>
    
    <label>
        <span>Alarm</span>
        <input 
            type="checkbox" 
            checked={alarmEnabled} 
            onChange={(e) => setAlarmEnabled(e.target.checked)} 
        />
    </label>
    
    <label>
        <span>Sound</span>
        <input 
            type="checkbox" 
            checked={soundEnabled} 
            onChange={(e) => setSoundEnabled(e.target.checked)} 
        />
    </label>
    
    <label>
        <span>Alarm Sound</span>
        <select value={alarmSound} onChange={(e) => setAlarmSound(e.target.value)}>
            <option value="beep">Beep</option>
            <option value="bell">Bell</option>
            <option value="buzzer">Buzzer</option>
            <option value="silent">Silent</option>
        </select>
    </label>
    
    <label>
        <span>Repeat Every</span>
        <select value={repeatInterval} onChange={(e) => setRepeatInterval(Number(e.target.value))}>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="120">2 minutes</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1800">30 minutes</option>
            <option value="3600">1 hour</option>
        </select>
    </label>
</div>