import { useCallback, useState } from 'react';
import { getRelativeCoordinates, getFulcrumDisplayPosition } from '../../../hooks';

const useConnectionDrag = ({
    containerRef,
    editorState,
    imageRect,
    fulcrums,
    onConnectionCreate,
    handleCanvasMouseDown
}) => {
    const [tempConnection, setTempConnection] = useState(null);
    const [isCreatingConnection, setIsCreatingConnection] = useState(false);

    const handleFulcrumDragStart = useCallback((fulcrum, e) => {
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;

        const displayPos = getFulcrumDisplayPosition(fulcrum, imageRect);

        setIsCreatingConnection(true);
        setTempConnection({
            from: fulcrum,
            fromPos: { x: displayPos.x, y: displayPos.y },
            toPos: { x: displayPos.x, y: displayPos.y }
        });
    }, [containerRef, imageRect]);

    const handleMouseMove = useCallback((e) => {
        if (!isCreatingConnection || !tempConnection) return;
        const container = containerRef.current;
        if (!container) return;

        const coords = getRelativeCoordinates(
            e,
            container,
            imageRect,
            editorState.offset,
            editorState.scale
        );

        setTempConnection(prev => ({
            ...prev,
            toPos: { x: coords.canvasX, y: coords.canvasY }
        }));
    }, [isCreatingConnection, tempConnection, containerRef, editorState.offset, editorState.scale, imageRect]);

    const handleMouseUp = useCallback((e) => {
        if (!isCreatingConnection || !tempConnection) return;
        const container = containerRef.current;

        const rect = container ? container.getBoundingClientRect() : null;
        const mouseX = rect ? e.clientX - rect.left : e.clientX;
        const mouseY = rect ? e.clientY - rect.top : e.clientY;
        const scale = editorState.scale || 1;
        const offset = editorState.offset || { x: 0, y: 0 };

        const targetFulcrum = fulcrums.find(fulcrum => {
            const displayPos = getFulcrumDisplayPosition(fulcrum, imageRect);
            const screenX = displayPos.x * scale + offset.x;
            const screenY = displayPos.y * scale + offset.y;
            const distance = Math.sqrt(
                Math.pow(mouseX - screenX, 2) +
                Math.pow(mouseY - screenY, 2)
            );
            return distance < 30;
        });

        if (targetFulcrum && targetFulcrum.id !== tempConnection.from.id) {
            onConnectionCreate?.(tempConnection.from, targetFulcrum);
        }

        setTempConnection(null);
        setIsCreatingConnection(false);
    }, [isCreatingConnection, tempConnection, containerRef, editorState.scale, editorState.offset, fulcrums, imageRect, onConnectionCreate]);

    const handleMouseDown = useCallback((e) => {
        if (isCreatingConnection) {
            e.preventDefault();
            return;
        }
        handleCanvasMouseDown(e);
    }, [isCreatingConnection, handleCanvasMouseDown]);

    return {
        isCreatingConnection,
        tempConnection,
        handleFulcrumDragStart,
        handleMouseMove,
        handleMouseUp,
        handleMouseDown
    };
};

export default useConnectionDrag;
