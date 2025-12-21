import React from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

const DashboardAlerts = ({ currentPet }) => {
    if (!currentPet) return null;

    const overdueVaccinations = currentPet.Vaccinations
        ? currentPet.Vaccinations.filter(v => v.NextDueDate && new Date(v.NextDueDate) < new Date())
        : [];

    const todayDate = new Date().toDateString();

    // Check reminders for today
    const todaysReminders = currentPet.Reminders
        ? currentPet.Reminders.filter(r => {
            // Basic check for one-time reminders today
            if (new Date(r.Date).toDateString() === todayDate) return true;
            // Repeating logic is complex, for simple alert we check "Daily"
            if (r.Frequency === 'Daily') return true;
            return false;
        })
        : [];

    const hasAlerts = overdueVaccinations.length > 0 || todaysReminders.length > 0;

    if (!hasAlerts) {
        return (
            <div className="alert alert-success shadow-sm border-0 mb-4" role="alert">
                <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                    <div>
                        <h5 className="alert-heading mb-0">All Caught Up!</h5>
                        <p className="mb-0 text-muted small">No overdue items or immediate reminders for today.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            {overdueVaccinations.length > 0 && (
                <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center mb-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-danger"></i>
                    <div className="w-100">
                        <h6 className="alert-heading fw-bold mb-1">Action Required: Overdue Vaccinations</h6>
                        <ul className="mb-0 ps-3 small">
                            {overdueVaccinations.map(v => (
                                <li key={v._id}>
                                    <strong>{v.Name}</strong> was due on <Moment format="MM/DD/YYYY">{v.NextDueDate}</Moment>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {todaysReminders.length > 0 && (
                <div className="alert alert-info shadow-sm border-0 d-flex align-items-center" role="alert" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1' }}>
                    <i className="bi bi-info-circle-fill fs-4 me-3 text-primary"></i>
                    <div className="w-100">
                        <h6 className="alert-heading fw-bold mb-1">Today's Reminders</h6>
                        <ul className="mb-0 ps-3 small">
                            {todaysReminders.map(r => (
                                <li key={r._id}>
                                    {r.Title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAlerts;
