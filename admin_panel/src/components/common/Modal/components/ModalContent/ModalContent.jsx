import React from 'react';
import './ModalContent.css';

const ModalContent = ({
                          children,
                          className = '',
                          textAlign = 'left'
                      }) => {
    const contentClass = `modal-content modal-content-${textAlign} ${className}`.trim();

    return (
        <div className={contentClass}>
            {children}
        </div>
    );
};

export default ModalContent;