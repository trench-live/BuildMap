import React from 'react';
import './Logo.css';

const Logo = ({ collapsed }) => {
    return (
        <div className="logo">
            <h1 className={collapsed ? 'collapsed' : ''}>
                🏨 {!collapsed && 'BuildMap Admin'}
            </h1>
        </div>
    );
};

export default Logo;