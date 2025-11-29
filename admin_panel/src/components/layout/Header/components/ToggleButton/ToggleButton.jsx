import React from 'react';
import './ToggleButton.css';

const ToggleButton = ({ collapsed, onToggle }) => {
    return (
        <button
            className="toggle-btn"
            onClick={onToggle}
            aria-label="Toggle sidebar"
        >
            {collapsed ? '→' : '←'}
        </button>
    );
};

export default ToggleButton;