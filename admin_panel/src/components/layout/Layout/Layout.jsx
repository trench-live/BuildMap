import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import { useLayout } from './hooks/useLayout';
import { useNavigation } from './hooks/useNavigation';
import { getPageTitle } from './utils/pageTitle';
import { MENU_ITEMS } from '../../../constants/menu';
import './Layout.css';

const Layout = ({ children }) => {
    const { collapsed, toggleSidebar } = useLayout();
    const { currentPath, handleMenuClick } = useNavigation();

    const pageTitle = getPageTitle(currentPath);

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={collapsed}
                menuItems={MENU_ITEMS}
                selectedKey={currentPath}
                onMenuClick={handleMenuClick}
            />

            <MainContent
                collapsed={collapsed}
                onToggle={toggleSidebar}
                pageTitle={pageTitle}
            >
                {children}
            </MainContent>
        </div>
    );
};

export default Layout;