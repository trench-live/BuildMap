import React from 'react';
import StatCard from '../StatCard/StatCard';
import './StatsGrid.css';

const StatsGrid = ({ stats, user }) => {
    const { getRoleDisplay } = require('../../utils/dashboardHelpers');

    const statItems = [
        {
            icon: "👥",
            value: stats.totalUsers,
            label: "Всего пользователей"
        },
        {
            icon: "🏢",
            value: stats.totalAreas,
            label: "Рабочих областей"
        },
        {
            icon: "✅",
            value: stats.activeUsers,
            label: "Активных пользователей"
        },
        {
            icon: user?.role === 'ADMIN' ? '👑' : '👤',
            value: getRoleDisplay(user?.role),
            label: "Ваша роль"
        }
    ];

    return (
        <div className="stats-grid">
            {statItems.map((stat, index) => (
                <StatCard
                    key={index}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                />
            ))}
        </div>
    );
};

export default StatsGrid;