import React from 'react';
import './NavigationItem.css';

const NavigationItem = ({
                            item,
                            isActive,
                            isCollapsed,
                            onClick
                        }) => {
    const handleClick = () => {
        onClick(item.key);
    };

    return (
        <div
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            title={isCollapsed ? item.label : ''} // tooltip для свернутого состояния
        >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
                <span className="nav-label">{item.label}</span>
            )}
        </div>
    );
};

export default NavigationItem;