import React from 'react';
import StatCard from '../StatCard/StatCard';
import './StatsGrid.css';

const StatsGrid = ({ items }) => {
    return (
        <div className="stats-grid">
            {items.map((stat, index) => (
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
