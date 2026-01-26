import React from 'react';
import Button from '../../../../../common/Modal/components/Button/Button';

const ToolbarRight = ({
    onClearCanvas,
    onSave,
    hasContent,
    isSaving,
    labels
}) => (
    <div className="toolbar-right">
        <div className="toolbar-group">
            <Button
                variant="secondary"
                size="small"
                onClick={onClearCanvas}
                disabled={!hasContent}
            >
                {labels.clear}
            </Button>
            <Button
                variant="primary"
                size="small"
                onClick={onSave}
                disabled={isSaving || !hasContent}
            >
                {isSaving ? labels.saving : labels.save}
            </Button>
        </div>
    </div>
);

export default ToolbarRight;
