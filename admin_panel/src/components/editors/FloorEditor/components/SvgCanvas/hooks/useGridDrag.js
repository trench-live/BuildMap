import { useCallback, useEffect, useRef, useState } from 'react';
import { getRelativeCoordinates } from '../../../hooks';

const useGridDrag = ({
    containerRef,
    editorState,
    setEditorState,
    gridMetrics,
    imageRect,
    wrapOffset
}) => {
    const [isGridDragging, setIsGridDragging] = useState(false);
    const [gridDragState, setGridDragState] = useState(null);
    const bodyCursorRef = useRef(null);
    const bodyUserSelectRef = useRef(null);
    const gridHandleRef = useRef(null);
    const lastGridClickRef = useRef(0);
    const lastPointerUnlockRef = useRef(0);

    const handleGridReset = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditorState(prev => ({
            ...prev,
            gridOffset: { x: 0, y: 0 }
        }));
    }, [setEditorState]);

    const handleGridHandleMouseDown = useCallback((e) => {
        if (!gridMetrics) return;
        const container = containerRef.current;
        if (!container) return;
        e.preventDefault();
        e.stopPropagation();

        const now = e.timeStamp || Date.now();
        if (now - lastGridClickRef.current < 280) {
            lastGridClickRef.current = 0;
            handleGridReset(e);
            return;
        }
        lastGridClickRef.current = now;

        const coords = getRelativeCoordinates(
            e,
            container,
            imageRect,
            editorState.offset,
            editorState.scale
        );

        setGridDragState({
            startX: coords.x,
            startY: coords.y,
            startOffsetX: editorState.gridOffset?.x ?? 0,
            startOffsetY: editorState.gridOffset?.y ?? 0,
            hasMoved: false
        });
    }, [gridMetrics, containerRef, imageRect, editorState.offset, editorState.scale, editorState.gridOffset, handleGridReset]);

    useEffect(() => {
        if (!isGridDragging) return;
        const body = document.body;
        if (!body) return;
        bodyCursorRef.current = body.style.cursor;
        bodyUserSelectRef.current = body.style.userSelect;
        body.style.cursor = 'none';
        body.style.userSelect = 'none';

        return () => {
            if (!body) return;
            body.style.cursor = bodyCursorRef.current ?? '';
            body.style.userSelect = bodyUserSelectRef.current ?? '';
        };
    }, [isGridDragging]);

    useEffect(() => {
        if (!gridDragState || !gridMetrics) return;

        const handleGridMove = (e) => {
            const container = containerRef.current;
            if (!container) return;
            const isPointerLocked = document.pointerLockElement === gridHandleRef.current;

            if (isPointerLocked) {
                const scaleValue = editorState.scale || 1;
                const denomX = imageRect.width * scaleValue;
                const denomY = imageRect.height * scaleValue;
                if (!denomX || !denomY) return;

                const deltaX = e.movementX / denomX;
                const deltaY = e.movementY / denomY;

                setEditorState(prev => {
                    const currentX = prev.gridOffset?.x ?? 0;
                    const currentY = prev.gridOffset?.y ?? 0;
                    const nextOffsetX = wrapOffset(currentX + deltaX, gridMetrics.stepXNorm);
                    const nextOffsetY = wrapOffset(currentY + deltaY, gridMetrics.stepYNorm);
                    return {
                        ...prev,
                        gridOffset: { x: nextOffsetX, y: nextOffsetY }
                    };
                });
                return;
            }

            const coords = getRelativeCoordinates(
                e,
                container,
                imageRect,
                editorState.offset,
                editorState.scale
            );

            const deltaX = coords.x - gridDragState.startX;
            const deltaY = coords.y - gridDragState.startY;
            const absMove = Math.hypot(deltaX, deltaY);
            if (!gridDragState.hasMoved && absMove < 0.004) {
                return;
            }

            if (!gridDragState.hasMoved) {
                setGridDragState(prev => prev ? { ...prev, hasMoved: true } : prev);
                setIsGridDragging(true);
                const now = Date.now();
                if (gridHandleRef.current?.requestPointerLock && now - lastPointerUnlockRef.current > 200) {
                    try {
                        gridHandleRef.current.requestPointerLock();
                    } catch {
                        // ignore pointer lock errors
                    }
                }
            }

            const nextOffsetX = wrapOffset(
                gridDragState.startOffsetX + deltaX,
                gridMetrics.stepXNorm
            );
            const nextOffsetY = wrapOffset(
                gridDragState.startOffsetY + deltaY,
                gridMetrics.stepYNorm
            );

            setEditorState(prev => ({
                ...prev,
                gridOffset: { x: nextOffsetX, y: nextOffsetY }
            }));
        };

        const handleGridUp = () => {
            setIsGridDragging(false);
            setGridDragState(null);
            if (document.pointerLockElement === gridHandleRef.current) {
                document.exitPointerLock?.();
            }
        };

        document.addEventListener('mousemove', handleGridMove);
        document.addEventListener('mouseup', handleGridUp, true);

        return () => {
            document.removeEventListener('mousemove', handleGridMove);
            document.removeEventListener('mouseup', handleGridUp, true);
        };
    }, [
        gridDragState,
        gridMetrics,
        imageRect,
        editorState.offset,
        editorState.scale,
        setEditorState,
        wrapOffset,
        containerRef
    ]);

    useEffect(() => {
        const handlePointerLockChange = () => {
            if (!isGridDragging) return;
            if (document.pointerLockElement !== gridHandleRef.current) {
                setIsGridDragging(false);
                setGridDragState(null);
                lastPointerUnlockRef.current = Date.now();
            }
        };
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
    }, [isGridDragging]);

    return {
        isGridDragging,
        gridHandleRef,
        handleGridHandleMouseDown,
        handleGridReset
    };
};

export default useGridDrag;
