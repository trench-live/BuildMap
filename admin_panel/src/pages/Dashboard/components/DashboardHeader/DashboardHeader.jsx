import React from 'react';
import { getGreeting } from '../../utils/timeUtils';
import './DashboardHeader.css';

const DashboardHeader = ({ userName }) => {
    return (
        <div className="dashboard-header">
            <h1>{getGreeting()}, {userName}!</h1>
            <p>Добро пожаловать в панель управления BuildMap</p>
        </div>
    );
};

export default DashboardHeader;