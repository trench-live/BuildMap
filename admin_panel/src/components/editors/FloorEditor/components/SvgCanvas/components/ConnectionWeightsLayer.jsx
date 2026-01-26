import React from 'react';
import { getFulcrumDisplayPosition } from '../../../hooks';

const ConnectionWeightsLayer = ({
    groupedConnections,
    fulcrums,
    imageRect,
    hoveredConnection,
    setHoveredConnection,
    onConnectionContextMenu,
    isSameConnection,
    uiScale
}) => (
    <>
        {groupedConnections.map((group, index) => {
            const fromFulcrum = fulcrums.find(f => f.id === group.from);
            const toFulcrum = fulcrums.find(f => f.id === group.to);
            if (!fromFulcrum || !toFulcrum) return null;

            const fromPos = getFulcrumDisplayPosition(fromFulcrum, imageRect);
            const toPos = getFulcrumDisplayPosition(toFulcrum, imageRect);
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (!Number.isFinite(length) || length === 0) return null;
            const weightT = 0.78;
            const weightTReturn = 1 - weightT;
            const isGroupHovered = hoveredConnection
                && ((hoveredConnection.from === group.from && hoveredConnection.to === group.to)
                    || (hoveredConnection.from === group.to && hoveredConnection.to === group.from));

            if (group.type === 'bidirectional') {
                const connectionAtoB = group.connections.find(conn => conn.from === group.from && conn.to === group.to);
                const connectionBtoA = group.connections.find(conn => conn.from === group.to && conn.to === group.from);
                const showWeightA = isGroupHovered;
                const showWeightB = isGroupHovered;

                return (
                    <React.Fragment key={`weights-${group.from}-${group.to}-${index}`}>
                        <div
                            className={`connection-weight-standalone${showWeightA ? ' is-visible' : ''}`}
                            style={{
                                left: `${fromPos.x + dx * weightT}px`,
                                top: `${fromPos.y + dy * weightT}px`,
                                position: 'absolute',
                                transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                                '--weight-scale': uiScale,
                                zIndex: 25
                            }}
                            onMouseEnter={() => setHoveredConnection(connectionAtoB)}
                            onMouseLeave={() => setHoveredConnection(null)}
                            onContextMenu={(e) => onConnectionContextMenu(connectionAtoB, e)}
                        >
                            {connectionAtoB?.weight}
                        </div>
                        <div
                            className={`connection-weight-standalone${showWeightB ? ' is-visible' : ''}`}
                            style={{
                                left: `${fromPos.x + dx * weightTReturn}px`,
                                top: `${fromPos.y + dy * weightTReturn}px`,
                                position: 'absolute',
                                transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                                '--weight-scale': uiScale,
                                zIndex: 25
                            }}
                            onMouseEnter={() => setHoveredConnection(connectionBtoA)}
                            onMouseLeave={() => setHoveredConnection(null)}
                            onContextMenu={(e) => onConnectionContextMenu(connectionBtoA, e)}
                        >
                            {connectionBtoA?.weight}
                        </div>
                    </React.Fragment>
                );
            }

            const showWeight = isSameConnection(hoveredConnection, group.connections[0]);

            return (
                <div
                    key={`weight-${group.from}-${group.to}`}
                    className={`connection-weight-standalone${showWeight ? ' is-visible' : ''}`}
                    style={{
                        left: `${fromPos.x + dx * weightT}px`,
                        top: `${fromPos.y + dy * weightT}px`,
                        position: 'absolute',
                        transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                        '--weight-scale': uiScale,
                        zIndex: 25
                    }}
                    onMouseEnter={() => setHoveredConnection(group.connections[0])}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onContextMenu={(e) => onConnectionContextMenu(group.connections[0], e)}
                >
                    {group.weights[0]}
                </div>
            );
        })}
    </>
);

export default ConnectionWeightsLayer;
