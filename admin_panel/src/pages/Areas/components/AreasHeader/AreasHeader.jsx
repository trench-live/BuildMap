import React from 'react';
import './AreasHeader.css';

const AreasHeader = ({ onCreateArea }) => {
    return (
        <div className="areas-header">
            <h2>🗺️ Мои картографические зоны</h2>
            <button className="btn btn-primary" onClick={onCreateArea}>
                + Добавить зону
            </button>
        </div>
    );
};

export default AreasHeader;