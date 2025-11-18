import React from 'react';
import { FULCRUM_POINT_ICONS } from './types/fulcrumTypes';
import './FulcrumPoint.css';

const FulcrumPoint = ({
                          fulcrum,
                          position,
                          isSelected = false,
                          isHovered = false,
                          onMouseEnter,
                          onMouseLeave,
                          onContextMenu,
                          onDragStart
                      }) => {
    const handleMouseDown = (e) => {
        if (e.button === 0) { // ЛКМ
            e.preventDefault();
            e.stopPropagation();
            if (onDragStart) {
                onDragStart(fulcrum, e);
            }
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(fulcrum, e);
        }
    };

    const pointClass = `fulcrum-point ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${fulcrum.type.toLowerCase()}`;

    return (
        <div
            className={pointClass}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            title={`${fulcrum.name} (${fulcrum.type})`}
        >
            <span className="fulcrum-icon">
                {FULCRUM_POINT_ICONS[fulcrum.type] || '📍'}
            </span>
            {isHovered && (
                <div className="fulcrum-tooltip">
                    <strong>{fulcrum.name}</strong>
                    {fulcrum.description && <div>{fulcrum.description}</div>}
                </div>
            )}
        </div>
    );
};

export default FulcrumPoint;