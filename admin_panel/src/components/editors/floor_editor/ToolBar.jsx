import React from 'react';

const Toolbar = ({
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
        <div className="floor-editor-toolbar">
            {/* Загрузка изображения */}
            <div className="toolbar-group">
                <input
                    type="file"
                    id="floor-image-upload"
                    className="file-input"
                    accept="image/*"
                    onChange={onImageUpload}
                />
                <label htmlFor="floor-image-upload" className="toolbar-btn">
                    📁 Загрузить изображение
                </label>
            </div>

            {/* Масштабирование */}
            <div className="toolbar-group">
                <button className="toolbar-btn" onClick={onZoomOut} disabled={scale <= 0.1}>
                    🔍−
                </button>
                <span className="scale-display">{Math.round(scale * 100)}%</span>
                <button className="toolbar-btn" onClick={onZoomIn} disabled={scale >= 5}>
                    🔍+
                </button>
                <button className="toolbar-btn" onClick={onResetView}>
                    🎯 Сброс
                </button>
            </div>

            {/* Действия */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn toolbar-btn-danger"
                    onClick={onClearCanvas}
                    disabled={!hasContent}
                >
                    🗑️ Очистить
                </button>
            </div>

            {/* Сохранение */}
            <div style={{ marginLeft: 'auto' }}>
                <button
                    className="toolbar-btn toolbar-btn-primary"
                    onClick={onSave}
                    disabled={!hasContent || isSaving}
                >
                    {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
                </button>
            </div>
        </div>
    );
};

export default Toolbar;