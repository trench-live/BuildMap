import React from 'react';
import ToggleButton from './components/ToggleButton/ToggleButton';
import UserMenu from './components/UserMenu/UserMenu';
import './Header.css';

const Header = ({ collapsed, onToggle, pageTitle }) => {
    return (
        <header className="header">
            <ToggleButton collapsed={collapsed} onToggle={onToggle} />

            <h1 className="page-title">{pageTitle}</h1>

            <div className="user-info">
                <UserMenu />
            </div>
        </header>
    );
};

export default Header;