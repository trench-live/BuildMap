import React from 'react';
import Logo from './components/Logo/Logo';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import './Sidebar.css';

const Sidebar = ({ collapsed, menuItems, selectedKey, onMenuClick }) => {
    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <Logo collapsed={collapsed} />
            <NavigationMenu
                menuItems={menuItems}
                selectedKey={selectedKey}
                collapsed={collapsed}
                onMenuClick={onMenuClick}
            />
        </div>
    );
};

export default Sidebar;