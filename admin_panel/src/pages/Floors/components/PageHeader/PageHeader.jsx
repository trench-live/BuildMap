import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, description }) => {
    return (
        <div className="page-header">
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
};

export default PageHeader;