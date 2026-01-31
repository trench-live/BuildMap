import React from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import UserDetails from '../UserDetails/UserDetails';
import './UserMenu.css';

const UserMenu = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            logout();
        }
    };

    if (!user) {
        return (
            <div className="loading-user">
                <span>Загрузка...</span>
            </div>
        );
    }

    return (
        <div className="user-menu">
            <UserDetails user={user} />
            <button className="logout-btn" onClick={handleLogout}>
                Выйти
            </button>
        </div>
    );
};

export default UserMenu;