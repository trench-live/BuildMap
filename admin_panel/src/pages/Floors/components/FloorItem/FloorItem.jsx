import React from 'react';
import { getFloorLabel } from '../../utils/floorHelpers';
import { hasSvgPlan } from '../../utils/floorHelpers';
import './FloorItem.css';

const FloorItem = ({
                       floor,
                       onEdit,
                       onDelete,
                       onOpenEditor
                   }) => {
    return (
        <div className="floor-item">
            <div className="floor-main">
                <div className="floor-icon">🏗️</div>
                <div className="floor-info">
                    <h5>{floor.name}</h5>
                    <p className="floor-level">
                        {getFloorLabel(floor.level)} {}
                    </p>
                    {floor.description && (
                        <p className="floor-description">
                            {floor.description}
                        </p>
                    )}
                    {hasSvgPlan(floor) && (
                        <p className="floor-plan-indicator">
                            📐 План загружен
                        </p>
                    )}
                </div>
            </div>
            <div className="floor-actions">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenEditor(floor)}
                >
                    📐 Редактировать план
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(floor)}
                >
                    Редактировать
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onDelete(floor)}
                >
                    Удалить
                </button>
            </div>
        </div>
    );
};

export default FloorItem;