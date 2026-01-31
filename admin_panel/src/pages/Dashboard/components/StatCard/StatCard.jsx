import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, value, label }) => {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
};

export default StatCard;