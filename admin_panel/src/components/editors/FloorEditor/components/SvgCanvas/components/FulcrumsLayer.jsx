import React from 'react';
import FulcrumPoint from '../../FulcrumPoint/FulcrumPoint';
import { getFulcrumDisplayPosition } from '../../../hooks';

const FulcrumsLayer = ({
    fulcrums,
    imageRect,
    hoveredFulcrum,
    setHoveredFulcrum,
    uiScale,
    moveFulcrumsEnabled,
    movingFulcrumId,
    onFulcrumContextMenu,
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
                    isHovered={hoveredFulcrum?.id === fulcrum.id}
                    uiScale={uiScale}
                    isMoveMode={moveFulcrumsEnabled}
                    isDragging={movingFulcrumId === fulcrum.id}
                    onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                    onMouseLeave={() => setHoveredFulcrum(null)}
                    onContextMenu={(f, e) => onFulcrumContextMenu && onFulcrumContextMenu(f, e)}
                    onDragStart={onFulcrumDragStart}
                />
            );
        })}
    </>
);

export default FulcrumsLayer;
