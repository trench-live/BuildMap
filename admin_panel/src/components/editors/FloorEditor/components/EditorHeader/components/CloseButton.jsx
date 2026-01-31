import React from 'react';

const CloseButton = ({ onClose }) => (
    <button className="close-btn" onClick={onClose} aria-label="??????? ????????">
        ×
    </button>
);

export default CloseButton;
