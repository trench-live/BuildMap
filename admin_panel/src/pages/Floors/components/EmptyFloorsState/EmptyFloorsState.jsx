import React from 'react';
import './EmptyFloorsState.css';

const EmptyFloorsState = ({ onAddFloor }) => {
    return (
        <div className="empty-floors">
            <p>В этой зоне пока нет этажей</p>
            <button
                className="btn btn-primary"
                onClick={onAddFloor}
            >
                + Создать этаж
            </button>
        </div>
    );
};

export default EmptyFloorsState;