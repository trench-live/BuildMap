import React from 'react';
import ToolbarLeft from './components/ToolbarLeft';
import ToolbarRight from './components/ToolbarRight';
import './EditorToolbar.css';

const labels = {
    gridEnabled: 'Сетка: вкл',
    gridDisabled: 'Сетка: выкл',
    upload: '📁 Загрузить изображение',
    resetView: '🏠 Сбросить вид',
    gridDecrease: 'Сетка -',
    gridIncrease: 'Сетка +',
    gridDecreaseTitle: 'Уменьшить шаг сетки',
    gridIncreaseTitle: 'Увеличить шаг сетки',
    statScaleIcon: '📏',
    statFulcrumIcon: '📍',
    statConnectionIcon: '🔗',
    clear: '🗑️ Очистить',
    save: '💾 Сохранить',
    saving: '💾 Сохранение...',
};

const EditorToolbar = ({
    onImageUpload,
    onResetView,
    onClearCanvas,
    onSave,
    onToggleGrid,
    onGridStepIncrease,
    onGridStepDecrease,
    scale,
    gridEnabled = false,
    hasContent,
    isSaving,
    fulcrumsCount = 0,
    connectionsCount = 0
}) => {
    const gridLabel = gridEnabled ? labels.gridEnabled : labels.gridDisabled;

    return (
        <div className="editor-toolbar">
            <ToolbarLeft
                onImageUpload={onImageUpload}
                onResetView={onResetView}
                onToggleGrid={onToggleGrid}
                onGridStepIncrease={onGridStepIncrease}
                onGridStepDecrease={onGridStepDecrease}
                scale={scale}
                gridEnabled={gridEnabled}
                gridLabel={gridLabel}
                hasContent={hasContent}
                fulcrumsCount={fulcrumsCount}
                connectionsCount={connectionsCount}
                labels={labels}
            />

            <ToolbarRight
                onClearCanvas={onClearCanvas}
                onSave={onSave}
                hasContent={hasContent}
                isSaving={isSaving}
                labels={labels}
            />
        </div>
    );
};

export default EditorToolbar;
