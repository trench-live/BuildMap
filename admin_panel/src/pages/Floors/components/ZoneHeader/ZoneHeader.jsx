import React from 'react';
import './ZoneHeader.css';

const ZoneHeader = ({ area, isExpanded, floorsCount, onToggle }) => {
    return (
        <div
            className={`zone-header ${isExpanded ? 'expanded' : ''}`}
            onClick={onToggle}
        >
            <div className="zone-info">
                <div className="zone-icon">🗺️</div>
                <div className="zone-content">
                    <h3>{area.name}</h3>
                    <p>{area.description || 'Описание отсутствует'}</p>
                </div>
            </div>
            <div className="zone-actions">
                <span className="zone-meta">
                    {floorsCount} этажей
                </span>
                <span className="expand-icon">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </div>
        </div>
    );
};

export default ZoneHeader;