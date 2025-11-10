import React from 'react';
import './Sidebar.css';

const Sidebar = ({ collapsed, menuItems, selectedKey, onMenuClick }) => {
    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="logo">
                <h1>🏨 BuildMap Admin</h1>
            </div>
            <nav className="nav-menu">
                {menuItems.map(item => (
                    <div
                        key={item.key}
                        className={`nav-item ${selectedKey === item.key ? 'active' : ''}`}
                        onClick={() => onMenuClick(item.key)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;