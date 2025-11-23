import React from 'react';
import './FulcrumConnection.css';

const FulcrumConnection = ({
                               connection,
                               fromFulcrum,
                               toFulcrum,
                               weight,
                               isHovered = false,
                               connectionType = 'unidirectional',
                               showWeight = false, // Добавляем этот пропс
                               onMouseEnter,
                               onMouseLeave,
                               onContextMenu
                           }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(connection, e);
        }
    };

    const handleMouseEnter = (e) => {
        e.stopPropagation();
        if (onMouseEnter) onMouseEnter();
    };

    const handleMouseLeave = (e) => {
        e.stopPropagation();
        if (onMouseLeave) onMouseLeave();
    };

    if (!fromFulcrum || !toFulcrum) return null;

    // Расчет длины и угла линии
    const dx = toFulcrum.x - fromFulcrum.x;
    const dy = toFulcrum.y - fromFulcrum.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const connectionClass = `fulcrum-connection ${isHovered ? 'hovered' : ''} ${connectionType}`;

    return (
        <div className={connectionClass}>
            <div
                className="connection-line-element"
                style={{
                    left: `${fromFulcrum.x}px`,
                    top: `${fromFulcrum.y}px`,
                    width: `${length}px`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 0'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onContextMenu={handleContextMenu}
            />

            {/* Для двунаправленных добавляем вторую стрелочку в начале */}
            {connectionType === 'bidirectional' && (
                <div
                    className="connection-line-element reverse-arrow"
                    style={{
                        left: `${fromFulcrum.x}px`,
                        top: `${fromFulcrum.y}px`,
                        width: `${length}px`,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '0 0'
                    }}
                />
            )}
        </div>
    );
};

export default FulcrumConnection;