import React from 'react';
import './LoginCard.css';

const LoginCard = ({ children }) => {
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>BuildMap Admin</h1>
                    <p>Система управления indoor навигацией</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default LoginCard;