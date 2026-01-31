import React from 'react';
import './AreaCard.css';

const AreaCard = ({ area }) => {
    return (
        <div className="area-card">
            <h4>{area.name}</h4>
            {area.description && (
                <p className="area-description">{area.description}</p>
            )}
            <div className="area-meta">
                <span>ID: {area.id}</span>
                {area.deleted && <span className="deleted-badge">Удалена</span>}
            </div>
        </div>
    );
};

export default AreaCard;