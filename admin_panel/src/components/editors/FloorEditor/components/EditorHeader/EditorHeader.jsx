import React from 'react';
import HeaderTitle from './components/HeaderTitle';
import CloseButton from './components/CloseButton';
import './EditorHeader.css';

const EditorHeader = ({ floorName, onClose }) => (
    <div className="editor-header">
        <HeaderTitle floorName={floorName} />
        <CloseButton onClose={onClose} />
    </div>
);

export default EditorHeader;
