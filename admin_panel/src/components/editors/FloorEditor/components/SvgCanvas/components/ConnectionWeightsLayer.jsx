import React from 'react';
import { getFulcrumDisplayPosition } from '../../../hooks';

const formatMetric = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    if (Math.abs(numeric - Math.round(numeric)) < 1e-9) {
        return `${Math.round(numeric)}`;
    }
    return numeric.toFixed(1);
};

const formatConnectionLabel = (connection) => {
    if (!connection) return '';
    const meters = formatMetric(connection.distanceMeters);
    if (!meters) return '';
    return `${meters} м`;
};

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
            const labelForwardRatio = 0.78;
            const labelBackwardRatio = 1 - labelForwardRatio;
            const isGroupHovered = hoveredConnection
                && ((hoveredConnection.from === group.from && hoveredConnection.to === group.to)
                    || (hoveredConnection.from === group.to && hoveredConnection.to === group.from));

            if (group.type === 'bidirectional') {
                const connectionAtoB = group.connections.find(conn => conn.from === group.from && conn.to === group.to);
                const connectionBtoA = group.connections.find(conn => conn.from === group.to && conn.to === group.from);
                const showLabelA = isGroupHovered;
                const showLabelB = isGroupHovered;

                return (
                    <React.Fragment key={`labels-${group.from}-${group.to}-${index}`}>
                        <div
                            className={`connection-distance-label${showLabelA ? ' is-visible' : ''}`}
                            style={{
                                left: `${fromPos.x + dx * labelForwardRatio}px`,
                                top: `${fromPos.y + dy * labelForwardRatio}px`,
                                position: 'absolute',
                                transform: 'translate(-50%, -50%) scale(var(--label-scale, 1))',
                                '--label-scale': uiScale,
                                zIndex: 25
                            }}
                            onMouseEnter={() => setHoveredConnection(connectionAtoB)}
                            onMouseLeave={() => setHoveredConnection(null)}
                            onContextMenu={(e) => onConnectionContextMenu(connectionAtoB, e)}
                        >
                            {formatConnectionLabel(connectionAtoB)}
                        </div>
                        <div
                            className={`connection-distance-label${showLabelB ? ' is-visible' : ''}`}
                            style={{
                                left: `${fromPos.x + dx * labelBackwardRatio}px`,
                                top: `${fromPos.y + dy * labelBackwardRatio}px`,
                                position: 'absolute',
                                transform: 'translate(-50%, -50%) scale(var(--label-scale, 1))',
                                '--label-scale': uiScale,
                                zIndex: 25
                            }}
                            onMouseEnter={() => setHoveredConnection(connectionBtoA)}
                            onMouseLeave={() => setHoveredConnection(null)}
                            onContextMenu={(e) => onConnectionContextMenu(connectionBtoA, e)}
                        >
                            {formatConnectionLabel(connectionBtoA)}
                        </div>
                    </React.Fragment>
                );
            }

            const showLabel = isSameConnection(hoveredConnection, group.connections[0]);

            return (
                <div
                    key={`label-${group.from}-${group.to}`}
                    className={`connection-distance-label${showLabel ? ' is-visible' : ''}`}
                    style={{
                        left: `${fromPos.x + dx * labelForwardRatio}px`,
                        top: `${fromPos.y + dy * labelForwardRatio}px`,
                        position: 'absolute',
                        transform: 'translate(-50%, -50%) scale(var(--label-scale, 1))',
                        '--label-scale': uiScale,
                        zIndex: 25
                    }}
                    onMouseEnter={() => setHoveredConnection(group.connections[0])}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onContextMenu={(e) => onConnectionContextMenu(group.connections[0], e)}
                >
                    {formatConnectionLabel(group.connections[0])}
                </div>
            );
        })}
    </>
);

export default ConnectionWeightsLayer;
