import React from 'react';
import { useFloorEditor } from './hooks/useFloorEditor';
import { useImageUpload } from './hooks/useImageUpload';
import EditorHeader from './components/EditorHeader/EditorHeader';
import EditorToolbar from './components/EditorToolbar/EditorToolbar';
import SvgCanvas from './components/SvgCanvas/SvgCanvas';
import './FloorEditor.css';

const FloorEditor = ({ floor, visible, onClose, onSave }) => {
    const {
        editorState,
        setEditorState,
        isSaving,
        handleSave,
        handleZoom,
        handleResetView,
        handleClearCanvas
    } = useFloorEditor(floor, onSave, onClose);

    const { handleImageUpload } = useImageUpload(setEditorState);

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal floor-editor-modal">
                <EditorHeader
                    floorName={floor?.name}
                    onClose={onClose}
                />

                <div className="floor-editor-content">
                    <EditorToolbar
                        onImageUpload={handleImageUpload}
                        onZoomIn={() => handleZoom(1.2)}
                        onZoomOut={() => handleZoom(0.8)}
                        onResetView={handleResetView}
                        onClearCanvas={handleClearCanvas}
                        onSave={handleSave}
                        scale={editorState.scale}
                        hasContent={!!editorState.svgContent}
                        isSaving={isSaving}
                    />

                    <SvgCanvas
                        editorState={editorState}
                        setEditorState={setEditorState}
                    />
                </div>
            </div>
        </div>
    );
};

export default FloorEditor;