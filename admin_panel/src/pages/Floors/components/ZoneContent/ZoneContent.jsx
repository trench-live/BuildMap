import React from 'react';
import './ZoneContent.css';

const ZoneContent = ({ children }) => {
    return (
        <div className="zone-content-area">
            {children}
        </div>
    );
};

export default ZoneContent;