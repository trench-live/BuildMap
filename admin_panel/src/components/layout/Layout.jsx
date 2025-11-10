import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { MENU_ITEMS } from '../../constants/menu';
import './Layout.css';

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (key) => {
        navigate(key);
    };

    const getPageTitle = () => {
        const currentItem = MENU_ITEMS.find(item => item.key === location.pathname);
        return currentItem?.label || 'Дашборд';
    };

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={collapsed}
                menuItems={MENU_ITEMS}
                selectedKey={location.pathname}
                onMenuClick={handleMenuClick}
            />

            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <Header
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    pageTitle={getPageTitle()}
                />

                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;