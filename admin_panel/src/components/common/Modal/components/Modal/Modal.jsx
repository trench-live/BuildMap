import React from 'react';
import './Modal.css';

const Modal = ({
                   children,
                   size = 'medium',
                   className = '',
                   ...props
               }) => {
    const modalClass = `modal modal-${size} ${className}`.trim();

    return (
        <div className={modalClass} {...props}>
            {children}
        </div>
    );
};

export default Modal;