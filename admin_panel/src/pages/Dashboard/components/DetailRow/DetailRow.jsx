import React from 'react';
import './DetailRow.css';

const DetailRow = ({ label, value, valueClassName = '' }) => {
    return (
        <div className="detail-row">
            <span className="detail-label">{label}</span>
            <span className={`detail-value ${valueClassName}`}>
                {value || 'Не указано'}
            </span>
        </div>
    );
};

export default DetailRow;