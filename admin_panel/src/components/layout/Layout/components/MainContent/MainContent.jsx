import React from 'react';
import Header from '../../../Header/Header';
import ContentArea from '../ContentArea/ContentArea';
import './MainContent.css';

const MainContent = ({
                         children,
                         collapsed,
                         onToggle,
                         pageTitle
                     }) => {
    return (
        <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
            <Header
                collapsed={collapsed}
                onToggle={onToggle}
                pageTitle={pageTitle}
            />
            <ContentArea>
                {children}
            </ContentArea>
        </div>
    );
};

export default MainContent;