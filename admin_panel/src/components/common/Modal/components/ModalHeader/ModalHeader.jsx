import React from 'react';
import './ModalHeader.css';

const ModalHeader = ({
                         title,
                         onClose,
                         showCloseButton = true,
                         children
                     }) => {
    return (
        <div className="modal-header">
            <h3>{title}</h3>
            <div className="modal-header-content">
                {children}
            </div>
            {showCloseButton && onClose && (
                <button className="close-btn" onClick={onClose} aria-label="Close">
                    ×
                </button>
            )}
        </div>
    );
};

export default ModalHeader;