import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

const ActivityTracker = ({ petId, activities = [], onUpdate }) => {
    const [form, setForm] = useState({
        type: "Walk",
        duration: 30,
        date: moment().format("YYYY-MM-DD"),
    });

    const [stats, setStats] = useState({
        streak: 0,
        totalMinutes: 0,
        lastMonth: []
    });

    useEffect(() => {
        calculateStats();
    }, [activities]);

    const calculateStats = () => {
        // 1. Total Minutes (This Month)
        const startOfMonth = moment().startOf('month');
        const thisMonthActs = activities.filter(a => moment(a.Date).isSameOrAfter(startOfMonth));
        const totalMins = thisMonthActs.reduce((acc, curr) => acc + (curr.Duration || 0), 0);

        // 2. Heatmap Data (Last 28 Days)
        const days = [];
        for (let i = 27; i >= 0; i--) {
            const d = moment().subtract(i, 'days');
            const dateStr = d.format('YYYY-MM-DD');
            const actOnDay = activities.filter(a => moment(a.Date).isSame(d, 'day'));
            const count = actOnDay.length;
            const mins = actOnDay.reduce((acc, curr) => acc + (curr.Duration || 0), 0);

            let intensity = "bg-secondary-subtle"; // default
            if (mins > 0) intensity = "bg-success opacity-25";
            if (mins >= 30) intensity = "bg-success opacity-50";
            if (mins >= 60) intensity = "bg-success";

            days.push({ date: dateStr, count, mins, intensity, display: d.format('MMM D') });
        }

        // 3. Simple Streak Calculation
        // Count consecutive days backwards from today where mins > 0
        let currentStreak = 0;
        for (let i = 0; i < 365; i++) {
            const d = moment().subtract(i, 'days');
            const hasActivity = activities.some(a => moment(a.Date).isSame(d, 'day'));
            if (hasActivity) {
                currentStreak++;
            } else if (i === 0 && !hasActivity) {
                // If no activity today yet, don't break streak from yesterday, but streak is arguably 0 for "today"
                // GitHub logic: streak counts if yesterday was active. 
                // Let's be lenient: check yesterday.
                continue;
            } else {
                break;
            }
        }

        setStats({
            streak: currentStreak,
            totalMinutes: totalMins,
            lastMonth: days
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ActivityType: form.type,
                Duration: parseInt(form.duration),
                Date: form.date,
            };
            const { data } = await axios.put(`/api/addPetActivity/${petId}`, payload, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") },
            });
            toast.success("Activity logged!");
            if (onUpdate) onUpdate(data);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || "Failed to log activity";
            toast.error(`Error: ${msg}`);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-success text-white">
                <h5 className="mb-0"><i className="bi bi-activity"></i> Activity & Routine Planner</h5>
            </div>
            <div className="card-body">
                <div className="row">
                    {/* Left: Input Form */}
                    <div className="col-md-4 border-end">
                        <h6 className="text-muted mb-3">Log New Activity</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label className="form-label small">Activity Type</label>
                                <select name="type" className="form-select form-select-sm" value={form.type} onChange={handleChange}>
                                    <option value="Walk">Walk 🐕</option>
                                    <option value="Play">Play 🎾</option>
                                    <option value="Training">Training 🧠</option>
                                    <option value="Grooming">Grooming ✂️</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Duration (mins)</label>
                                <input name="duration" type="number" className="form-control form-control-sm" value={form.duration} onChange={handleChange} min="1" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small">Date</label>
                                <input name="date" type="date" className="form-control form-control-sm" value={form.date} onChange={handleChange} />
                            </div>
                            <button className="btn btn-success btn-sm w-100" type="submit">Log Activity</button>
                        </form>
                    </div>

                    {/* Right: Stats & Heatmap */}
                    <div className="col-md-8">
                        <div className="d-flex justify-content-around mb-3 text-center">
                            <div>
                                <h3 className="mb-0 text-success fw-bold">{stats.totalMinutes}</h3>
                                <small className="text-muted">Mins (This Month)</small>
                            </div>
                            <div>
                                <h3 className="mb-0 text-primary fw-bold">{stats.streak} <i className="bi bi-fire text-danger"></i></h3>
                                <small className="text-muted">Day Streak</small>
                            </div>
                        </div>

                        <h6 className="text-muted small mb-2">Routine Consistency (Last 28 Days)</h6>
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: "400px" }}>
                            {stats.lastMonth.map((day, idx) => (
                                <OverlayTrigger
                                    key={idx}
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`tooltip-${idx}`}>
                                            <strong>{day.display}</strong>: {day.mins} mins
                                        </Tooltip>
                                    }
                                >
                                    <div
                                        className={`rounded-1 border ${day.intensity}`}
                                        style={{ width: "25px", height: "25px", cursor: "pointer" }}
                                    ></div>
                                </OverlayTrigger>
                            ))}
                        </div>
                        <div className="d-flex justify-content-end align-items-center mt-1 gap-2">
                            <span className="small text-muted" style={{ fontSize: "10px" }}>Less</span>
                            <div className="bg-secondary-subtle border rounded-1" style={{ width: "10px", height: "10px" }}></div>
                            <div className="bg-success opacity-25 border rounded-1" style={{ width: "10px", height: "10px" }}></div>
                            <div className="bg-success opacity-50 border rounded-1" style={{ width: "10px", height: "10px" }}></div>
                            <div className="bg-success border rounded-1" style={{ width: "10px", height: "10px" }}></div>
                            <span className="small text-muted" style={{ fontSize: "10px" }}>More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityTracker;
