import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRelativeCoordinates } from '../../../hooks';

const clamp01 = (value) => Number(Math.min(1, Math.max(0, value)).toFixed(6));

const useFulcrumMove = ({
    containerRef,
    editorState,
    imageRect,
    gridMetrics,
    fulcrums,
    onFulcrumMove,
    snapToGrid
}) => {
    const [dragState, setDragState] = useState(null);

    const getNormalizedPosition = useCallback((event) => {
        const container = containerRef.current;
        if (!container) {
            return null;
        }

        const coords = getRelativeCoordinates(
            event,
            container,
            imageRect,
            editorState.offset,
            editorState.scale
        );

        let nextX = coords.x;
        let nextY = coords.y;

        if (gridMetrics) {
            const offsetX = editorState.gridOffset?.x ?? 0;
            const offsetY = editorState.gridOffset?.y ?? 0;
            nextX = snapToGrid(nextX - offsetX, gridMetrics.stepXNorm) + offsetX;
            nextY = snapToGrid(nextY - offsetY, gridMetrics.stepYNorm) + offsetY;
        }

        return {
            x: clamp01(nextX),
            y: clamp01(nextY)
        };
    }, [
        containerRef,
        editorState.offset,
        editorState.scale,
        editorState.gridOffset,
        imageRect,
        gridMetrics,
        snapToGrid
    ]);

    const handleFulcrumMoveStart = useCallback((fulcrum, event) => {
        if (!editorState.moveFulcrumsEnabled || event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        setDragState({
            fulcrum,
            position: {
                x: clamp01(fulcrum.x),
                y: clamp01(fulcrum.y)
            },
            hasMoved: false,
            isPersisting: false
        });
    }, [editorState.moveFulcrumsEnabled]);

    useEffect(() => {
        if (!dragState || dragState.isPersisting) {
            return undefined;
        }

        const handleMove = (event) => {
            const nextPosition = getNormalizedPosition(event);
            if (!nextPosition) {
                return;
            }

            setDragState((prev) => {
                if (!prev) {
                    return prev;
                }

                const hasMoved = prev.hasMoved
                    || Math.abs(prev.position.x - nextPosition.x) > 0.0001
                    || Math.abs(prev.position.y - nextPosition.y) > 0.0001;

                if (
                    prev.position.x === nextPosition.x
                    && prev.position.y === nextPosition.y
                    && prev.hasMoved === hasMoved
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    position: nextPosition,
                    hasMoved
                };
            });
        };

        const handleUp = async () => {
            const currentState = dragState;
            if (!currentState) {
                return;
            }

            if (!currentState.hasMoved) {
                setDragState(null);
                return;
            }

            setDragState((prev) => prev ? { ...prev, isPersisting: true } : prev);

            try {
                await onFulcrumMove?.(currentState.fulcrum.id, currentState.position);
            } catch (error) {
                const message = error?.response?.data?.message || error?.message || 'Unknown error';
                alert(`Failed to update point position: ${message}`);
            } finally {
                setDragState(null);
            }
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp, true);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp, true);
        };
    }, [dragState, getNormalizedPosition, onFulcrumMove]);

    const effectiveFulcrums = useMemo(() => {
        if (!dragState) {
            return fulcrums;
        }

        return fulcrums.map((fulcrum) => (
            fulcrum.id === dragState.fulcrum.id
                ? {
                    ...fulcrum,
                    x: dragState.position.x,
                    y: dragState.position.y
                }
                : fulcrum
        ));
    }, [dragState, fulcrums]);

    return {
        effectiveFulcrums,
        isMovingFulcrum: Boolean(dragState),
        movingFulcrumId: dragState?.fulcrum?.id ?? null,
        handleFulcrumMoveStart
    };
};

export default useFulcrumMove;
