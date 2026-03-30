import React from 'react';
import './FulcrumConnection.css';

const FulcrumConnection = ({
    connection,
    fromFulcrum,
    toFulcrum,
    isHovered = false,
    connectionType = 'unidirectional',
    onMouseEnter,
    onMouseLeave,
    onContextMenu
}) => {
    const handleContextMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (onContextMenu) {
            onContextMenu(connection, event);
        }
    };

    const handleMouseEnter = (event) => {
        event.stopPropagation();
        if (onMouseEnter) onMouseEnter();
    };

    const handleMouseLeave = (event) => {
        event.stopPropagation();
        if (onMouseLeave) onMouseLeave();
    };

    if (!fromFulcrum || !toFulcrum) return null;

    const dx = toFulcrum.x - fromFulcrum.x;
    const dy = toFulcrum.y - fromFulcrum.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const arrowOffset = Math.min(7, Math.max(3, length * 0.12));
    const isShort = length < 40;

    const connectionClass = `fulcrum-connection ${isHovered ? 'hovered' : ''} ${connectionType}`;

    return (
        <div className={connectionClass}>
            <div
                className={`connection-line-element${isShort ? ' is-short' : ''}`}
                style={{
                    left: `${fromFulcrum.x}px`,
                    top: `${fromFulcrum.y}px`,
                    width: `${length}px`,
                    '--arrow-offset': `${arrowOffset}px`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 0'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onContextMenu={handleContextMenu}
            />

            {connectionType === 'bidirectional' && (
                <div
                    className={`connection-line-element reverse-arrow${isShort ? ' is-short' : ''}`}
                    style={{
                        left: `${fromFulcrum.x}px`,
                        top: `${fromFulcrum.y}px`,
                        width: `${length}px`,
                        '--arrow-offset': `${arrowOffset}px`,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '0 0'
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={handleContextMenu}
                />
            )}
        </div>
    );
};

export default FulcrumConnection;
