import React from 'react';
import './FulcrumConnection.css';

const FulcrumConnection = ({ fromFulcrum, toFulcrum, weight, onContextMenu }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(e);
        }
    };

    // Расчет середины линии для отображения веса
    const midX = (fromFulcrum.x + toFulcrum.x) / 2;
    const midY = (fromFulcrum.y + toFulcrum.y) / 2;

    return (
        <div className="fulcrum-connection">
            <svg className="connection-svg">
                <line
                    x1={fromFulcrum.x}
                    y1={fromFulcrum.y}
                    x2={toFulcrum.x}
                    y2={toFulcrum.y}
                    stroke="#6b7280"
                    strokeWidth="2"
                    className="connection-line"
                    onContextMenu={handleContextMenu}
                />
            </svg>

            <div
                className="connection-weight"
                style={{
                    left: `${midX}px`,
                    top: `${midY}px`,
                    position: 'absolute'
                }}
                onContextMenu={handleContextMenu}
            >
                {weight}
            </div>
        </div>
    );
};

export default FulcrumConnection;