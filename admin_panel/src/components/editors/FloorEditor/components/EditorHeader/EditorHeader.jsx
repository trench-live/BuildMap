import React from 'react';
import './EditorHeader.css';

const EditorHeader = ({ floorName, onClose }) => {
    return (
        <div className="editor-header">
            <h3>Редактор этажа: {floorName}</h3>
            <button className="close-btn" onClick={onClose} aria-label="Закрыть редактор">
                ×
            </button>
        </div>
    );
};

export default EditorHeader;