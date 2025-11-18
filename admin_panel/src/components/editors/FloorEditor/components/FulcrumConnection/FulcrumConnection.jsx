import React from 'react';
import './FulcrumConnection.css';

const FulcrumConnection = ({ from, to, weight, onContextMenu }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(e);
        }
    };

    // Расчет середины линии для отображения веса
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    return (
        <div className="fulcrum-connection">
            <svg className="connection-svg">
                <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
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
                }}
                onContextMenu={handleContextMenu}
            >
                {weight}
            </div>
        </div>
    );
};

export default FulcrumConnection;