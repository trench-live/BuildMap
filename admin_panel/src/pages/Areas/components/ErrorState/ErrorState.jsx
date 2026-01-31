import React from 'react';
import './ErrorState.css';

const ErrorState = ({ message, onRetry }) => {
    return (
        <div className="error-state">
            <div className="error-icon">❌</div>
            <div className="error-message">{message}</div>
            {onRetry && (
                <button className="btn btn-primary" onClick={onRetry}>
                    Попробовать снова
                </button>
            )}
        </div>
    );
};

export default ErrorState;