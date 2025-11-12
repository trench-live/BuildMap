import React from 'react';
import ToolbarGroup from '../ToolbarGroup/ToolbarGroup';
import './EditorToolbar.css';

const EditorToolbar = ({
                           onImageUpload,
                           onZoomIn,
                           onZoomOut,
                           onResetView,
                           onClearCanvas,
                           onSave,
                           scale,
                           hasContent,
                           isSaving
                       }) => {
    return (
        <div className="editor-toolbar">
            {/* Группа загрузки изображения */}
            <ToolbarGroup>
                <input
                    type="file"
                    id="floor-image-upload"
                    className="file-input"
                    accept="image/jpeg,image/png,image/svg+xml,image/gif"
                    onChange={onImageUpload}
                />
                <label htmlFor="floor-image-upload" className="toolbar-btn">
                    📁 Загрузить изображение
                </label>
            </ToolbarGroup>

            {/* Группа масштабирования */}
            <ToolbarGroup>
                <button
                    className="toolbar-btn"
                    onClick={onZoomOut}
                    disabled={scale <= 0.1}
                    title="Уменьшить (25%)"
                >
                    🔍−
                </button>
                <span className="scale-display">{Math.round(scale * 100)}%</span>
                <button
                    className="toolbar-btn"
                    onClick={onZoomIn}
                    disabled={scale >= 5}
                    title="Увеличить (25%)"
                >
                    🔍+
                </button>
                <button
                    className="toolbar-btn"
                    onClick={onResetView}
                    title="Сбросить вид к 100%"
                >
                    🎯 Сброс
                </button>
            </ToolbarGroup>

            {/* Группа действий */}
            <ToolbarGroup>
                <button
                    className="toolbar-btn toolbar-btn-danger"
                    onClick={onClearCanvas}
                    disabled={!hasContent}
                    title="Очистить холст"
                >
                    🗑️ Очистить
                </button>
            </ToolbarGroup>

            {/* Группа сохранения */}
            <div className="toolbar-actions">
                <button
                    className="toolbar-btn toolbar-btn-primary"
                    onClick={onSave}
                    disabled={!hasContent || isSaving}
                    title="Сохранить изменения"
                >
                    {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
                </button>
            </div>
        </div>
    );
};

export default EditorToolbar;