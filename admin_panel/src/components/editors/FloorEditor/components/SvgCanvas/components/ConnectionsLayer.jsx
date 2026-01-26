import React from 'react';
import FulcrumConnection from '../../FulcrumConnection/FulcrumConnection';
import { getFulcrumDisplayPosition } from '../../../hooks';

const ConnectionsLayer = ({
    groupedConnections,
    fulcrums,
    imageRect,
    hoveredConnection,
    setHoveredConnection,
    onConnectionContextMenu,
    isSameConnection
}) => (
    <>
        {groupedConnections.map((group, index) => {
            const fromFulcrum = fulcrums.find(f => f.id === group.from);
            const toFulcrum = fulcrums.find(f => f.id === group.to);
            if (!fromFulcrum || !toFulcrum) return null;

            const fromPos = getFulcrumDisplayPosition(fromFulcrum, imageRect);
            const toPos = getFulcrumDisplayPosition(toFulcrum, imageRect);
            const isHovered = group.connections.some(conn => isSameConnection(hoveredConnection, conn));

            return (
                <FulcrumConnection
                    key={`line-${group.from}-${group.to}-${index}`}
                    connection={group.connections[0]}
                    fromFulcrum={fromPos}
                    toFulcrum={toPos}
                    weight={group.weights[0]}
                    isHovered={isHovered}
                    connectionType={group.type}
                    onMouseEnter={() => setHoveredConnection(group.connections[0])}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onContextMenu={onConnectionContextMenu}
                    showWeight={false}
                />
            );
        })}
    </>
);

export default ConnectionsLayer;
