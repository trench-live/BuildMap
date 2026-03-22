import React from 'react';
import FulcrumPoint from '../../FulcrumPoint/FulcrumPoint';
import { getFulcrumDisplayPosition } from '../../../hooks';

const FulcrumsLayer = ({
    fulcrums,
    imageRect,
    hoveredFulcrum,
    setHoveredFulcrum,
    uiScale,
    selectedFulcrumIds,
    moveFulcrumsEnabled,
    movingFulcrumIds,
    onFulcrumContextMenu,
    onFulcrumClick,
    onFulcrumDragStart
}) => (
    <>
        {fulcrums.map((fulcrum) => {
            const displayPos = getFulcrumDisplayPosition(fulcrum, imageRect);

            return (
                <FulcrumPoint
                    key={fulcrum.id}
                    fulcrum={fulcrum}
                    position={displayPos}
                    isSelected={selectedFulcrumIds?.includes(fulcrum.id)}
                    isHovered={hoveredFulcrum?.id === fulcrum.id}
                    uiScale={uiScale}
                    isMoveMode={moveFulcrumsEnabled}
                    isDragging={movingFulcrumIds?.includes(fulcrum.id)}
                    onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                    onMouseLeave={() => setHoveredFulcrum(null)}
                    onContextMenu={(f, e) => onFulcrumContextMenu && onFulcrumContextMenu(f, e)}
                    onClick={onFulcrumClick}
                    onDragStart={onFulcrumDragStart}
                />
            );
        })}
    </>
);

export default FulcrumsLayer;
