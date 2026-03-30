import React from 'react';
import { getRoleDisplay, formatUserIdentity } from '../../utils/userFormatters';
import './UserDetails.css';

const UserDetails = ({ user }) => {
    return (
        <div className="user-details">
            <span className="welcome-text">
                👋 Привет, {user.name}!
            </span>
            <div className="user-meta">
                <span className="user-role">
                    {getRoleDisplay(user.role)}
                </span>
                <span className="user-telegram">
                    {formatUserIdentity(user)}
                </span>
            </div>
        </div>
    );
};

export default UserDetails;
