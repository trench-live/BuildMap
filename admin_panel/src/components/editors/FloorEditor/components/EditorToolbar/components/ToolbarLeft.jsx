import React from 'react';
import Button from '../../../../../common/Modal/components/Button/Button';

const ToolbarLeft = ({
    onImageUpload,
    onResetView,
    onToggleGrid,
    onGridStepIncrease,
    onGridStepDecrease,
    scale,
    gridEnabled,
    gridLabel,
    hasContent,
    fulcrumsCount,
    connectionsCount,
    labels
}) => {
    const handleImageUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.svg';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                onImageUpload(file);
            }
        };
        input.click();
    };

    return (
        <div className="toolbar-left">
            <div className="toolbar-group">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleImageUploadClick}
                >
                    {labels.upload}
                </Button>
            </div>

            <div className="toolbar-group">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={onResetView}
                    disabled={!hasContent}
                >
                    {labels.resetView}
                </Button>
            </div>

            <div className="toolbar-group">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={onToggleGrid}
                    className="grid-toggle"
                >
                    {gridLabel}
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={onGridStepDecrease}
                    disabled={!gridEnabled}
                    title={labels.gridDecreaseTitle}
                >
                    {labels.gridDecrease}
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={onGridStepIncrease}
                    disabled={!gridEnabled}
                    title={labels.gridIncreaseTitle}
                >
                    {labels.gridIncrease}
                </Button>
            </div>

            <div className="toolbar-stats">
                <span className="stat-item">{labels.statScaleIcon} {Math.round(scale * 100)}%</span>
                <span className="stat-item">{labels.statFulcrumIcon} {fulcrumsCount}</span>
                <span className="stat-item">{labels.statConnectionIcon} {connectionsCount}</span>
            </div>
        </div>
    );
};

export default ToolbarLeft;
