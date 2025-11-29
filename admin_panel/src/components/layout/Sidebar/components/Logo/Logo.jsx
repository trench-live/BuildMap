import React from 'react';
import './Logo.css';

const Logo = ({ collapsed }) => {
    return (
        <div className="logo">
            <div className="logo-container">
                <div className="logo-svg">
                    <img
                        src="/logo.svg"
                        alt="BuildMap Admin Logo"
                        className="logo-image"
                    />
                </div>
                {!collapsed && <h1 className="logo-text">BuildMap Admin</h1>}
            </div>
        </div>
    );
};

export default Logo;