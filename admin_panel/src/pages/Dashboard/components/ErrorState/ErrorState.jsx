import React from 'react';

const ErrorState = ({ error, onRetry }) => {
    return (
        <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={onRetry}>
                Попробовать снова
            </button>
        </div>
    );
};

export default ErrorState;