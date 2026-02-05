import React from 'react';
import './EmptyAreasState.css';

const EmptyAreasState = () => {
    const handleCreateArea = () => {
        window.location.href = '/areas';
    };

    return (
        <div className="empty-state">
            <p>Пока нет рабочих областей</p>
            <button className="primary-btn" onClick={handleCreateArea}>
                Создать первую область
            </button>
        </div>
    );
};

export default EmptyAreasState;