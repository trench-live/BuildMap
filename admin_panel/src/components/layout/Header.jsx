import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = ({ collapsed, onToggle, pageTitle }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            logout();
        }
    };

    const getRoleDisplay = (role) => {
        const roleMap = {
            'ADMIN': '👑 Администратор',
            'USER': '👤 Пользователь'
        };
        return roleMap[role] || '👤 Пользователь';
    };

    const formatTelegramId = (telegramId) => {
        if (!telegramId) return '';
        return telegramId.startsWith('test_') ? 'Тестовый аккаунт' : `ID: ${telegramId}`;
    };

    return (
        <header className="header">
            <button className="toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
                {collapsed ? '→' : '←'}
            </button>

            <h1 className="page-title">{pageTitle}</h1>

            <div className="user-info">
                {user ? (
                    <div className="user-menu">
                        <div className="user-details">
              <span className="welcome-text">
                👋 Привет, {user.name}!
              </span>
                            <div className="user-meta">
                <span className="user-role">
                  {getRoleDisplay(user.role)}
                </span>
                                <span className="user-telegram">
                  {formatTelegramId(user.telegramId)}
                </span>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                ) : (
                    <div className="loading-user">
                        <span>Загрузка...</span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;