import React from 'react';
import './ZoneHeader.css';

const labels = {
    noDescription: 'Описание отсутствует'
};

const getFloorsCountLabel = (value) => {
    const parsedValue = Number(value);
    const count = Number.isFinite(parsedValue) ? parsedValue : 0;
    const absCount = Math.abs(count) % 100;
    const lastDigit = absCount % 10;

    let word = 'этажей';
    if (absCount < 11 || absCount > 14) {
        if (lastDigit === 1) {
            word = 'этаж';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            word = 'этажа';
        }
    }

    return `${count} ${word}`;
};

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
                    <p>{area.description || labels.noDescription}</p>
                </div>
            </div>
            <div className="zone-actions">
                <span className="zone-meta">
                    {getFloorsCountLabel(floorsCount)}
                </span>
                <span className="expand-icon">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </div>
        </div>
    );
};

export default ZoneHeader;
