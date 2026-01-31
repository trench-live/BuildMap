import React from 'react';
import './ToolbarGroup.css';

const ToolbarGroup = ({ children, className = '' }) => {
    return (
        <div className={`toolbar-group ${className}`}>
            {children}
        </div>
    );
};

export default ToolbarGroup;