import React from 'react';
import NavigationItem from '../NavigationItem/NavigationItem';
import './NavigationMenu.css';

const NavigationMenu = ({
                            menuItems,
                            selectedKey,
                            collapsed,
                            onMenuClick
                        }) => {
    return (
        <nav className="nav-menu">
            {menuItems.map(item => (
                <NavigationItem
                    key={item.key}
                    item={item}
                    isActive={selectedKey === item.key}
                    isCollapsed={collapsed}
                    onClick={onMenuClick}
                />
            ))}
        </nav>
    );
};

export default NavigationMenu;