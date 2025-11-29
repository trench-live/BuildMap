import React from 'react';
import './ModalOverlay.css';

const ModalOverlay = ({ children, onClick }) => {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClick) {
            onClick();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            {children}
        </div>
    );
};

export default ModalOverlay;