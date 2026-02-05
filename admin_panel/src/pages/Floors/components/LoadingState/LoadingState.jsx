import React from 'react';
import './LoadingState.css';

const LoadingState = ({ message = "Загрузка..." }) => {
    return (
        <div className="loading">
            {message}
        </div>
    );
};

export default LoadingState;