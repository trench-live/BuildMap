import React from 'react';
import './LoadingState.css';

const LoadingState = () => {
    return (
        <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
        </div>
    );
};

export default LoadingState;