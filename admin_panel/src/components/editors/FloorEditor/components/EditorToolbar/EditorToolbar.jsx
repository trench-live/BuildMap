import React from 'react';
import ToolbarLeft from './components/ToolbarLeft';
import ToolbarRight from './components/ToolbarRight';
import './EditorToolbar.css';

const labels = {
    gridEnabled: '\u0421\u0435\u0442\u043a\u0430: \u0432\u043a\u043b',
    gridDisabled: '\u0421\u0435\u0442\u043a\u0430: \u0432\u044b\u043a\u043b',
    moveMode: '\u0414\u0432\u0438\u0433\u0430\u0442\u044c \u0442\u043e\u0447\u043a\u0438',
    upload: '\ud83d\udcc1 \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435',
    resetView: '\ud83c\udfe0 \u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0432\u0438\u0434',
    gridDecrease: '\u0421\u0435\u0442\u043a\u0430 -',
    gridIncrease: '\u0421\u0435\u0442\u043a\u0430 +',
    gridDecreaseTitle: '\u0423\u043c\u0435\u043d\u044c\u0448\u0438\u0442\u044c \u0448\u0430\u0433 \u0441\u0435\u0442\u043a\u0438',
    gridIncreaseTitle: '\u0423\u0432\u0435\u043b\u0438\u0447\u0438\u0442\u044c \u0448\u0430\u0433 \u0441\u0435\u0442\u043a\u0438',
    statScaleIcon: '\ud83d\udccf',
    statFulcrumIcon: '\ud83d\udccd',
    statConnectionIcon: '\ud83d\udd17',
    statSelectedLabel: 'Selected',
    clear: '\ud83d\uddd1\ufe0f \u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c',
    save: '\ud83d\udcbe \u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c',
    saving: '\ud83d\udcbe \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435...'
};

const EditorToolbar = ({
    onImageUpload,
    onResetView,
    onToggleMoveFulcrums,
    onClearCanvas,
    onSave,
    onToggleGrid,
    onGridStepIncrease,
    onGridStepDecrease,
    scale,
    moveFulcrumsEnabled = false,
    gridEnabled = false,
    hasContent,
    isSaving,
    fulcrumsCount = 0,
    connectionsCount = 0,
    selectedFulcrumsCount = 0
}) => {
    const gridLabel = gridEnabled ? labels.gridEnabled : labels.gridDisabled;

    return (
        <div className="editor-toolbar">
            <ToolbarLeft
                onImageUpload={onImageUpload}
                onResetView={onResetView}
                onToggleMoveFulcrums={onToggleMoveFulcrums}
                onToggleGrid={onToggleGrid}
                onGridStepIncrease={onGridStepIncrease}
                onGridStepDecrease={onGridStepDecrease}
                scale={scale}
                moveFulcrumsEnabled={moveFulcrumsEnabled}
                gridEnabled={gridEnabled}
                gridLabel={gridLabel}
                hasContent={hasContent}
                fulcrumsCount={fulcrumsCount}
                connectionsCount={connectionsCount}
                selectedFulcrumsCount={selectedFulcrumsCount}
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
