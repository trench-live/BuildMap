import React from 'react';
import Button from '../../../../common/Modal/components/Button/Button';
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
                           isSaving,
                           fulcrumsCount = 0,
                           connectionsCount = 0
                       }) => {
    const handleImageUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.svg';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                onImageUpload(file); // Передаем файл, а не event
            }
        };
        input.click();
    };

    return (
        <div className="editor-toolbar">
            <div className="toolbar-left">
                <div className="toolbar-group">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={handleImageUploadClick}
                    >
                        📁 Загрузить изображение
                    </Button>
                </div>

                <div className="toolbar-group">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onZoomIn}
                        disabled={!hasContent}
                    >
                        🔍 Увеличить
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onZoomOut}
                        disabled={!hasContent}
                    >
                        🔎 Уменьшить
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onResetView}
                        disabled={!hasContent}
                    >
                        🏠 Сбросить вид
                    </Button>
                </div>

                <div className="toolbar-stats">
                    <span className="stat-item">📏 {Math.round(scale * 100)}%</span>
                    <span className="stat-item">📍 {fulcrumsCount}</span>
                    <span className="stat-item">🔗 {connectionsCount}</span>
                </div>
            </div>

            <div className="toolbar-right">
                <div className="toolbar-group">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onClearCanvas}
                        disabled={!hasContent}
                    >
                        🗑️ Очистить
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={onSave}
                        disabled={isSaving || !hasContent}
                    >
                        {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditorToolbar;