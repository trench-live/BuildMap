import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getRelativeCoordinates } from '../../../hooks';

const clamp01 = (value) => Number(Math.min(1, Math.max(0, value)).toFixed(6));
const clampBetween = (value, min, max) => Math.min(max, Math.max(min, value));

const useFulcrumMove = ({
    containerRef,
    editorState,
    setEditorState,
    imageRect,
    gridMetrics,
    fulcrums,
    onFulcrumsMove,
    snapToGrid
}) => {
    const [dragState, setDragState] = useState(null);
    const clickToggleCandidateRef = useRef(null);
    const selectedFulcrumIds = useMemo(
        () => editorState.selectedFulcrumIds || [],
        [editorState.selectedFulcrumIds]
    );

    const selectedIdSet = useMemo(
        () => new Set(selectedFulcrumIds),
        [selectedFulcrumIds]
    );

    useEffect(() => {
        if (!selectedFulcrumIds.length) {
            return;
        }

        const availableIds = new Set(fulcrums.map((fulcrum) => fulcrum.id));
        const nextSelectedIds = selectedFulcrumIds.filter((id) => availableIds.has(id));
        if (nextSelectedIds.length === selectedFulcrumIds.length) {
            return;
        }

        setEditorState((prev) => ({
            ...prev,
            selectedFulcrumIds: nextSelectedIds
        }));
    }, [fulcrums, selectedFulcrumIds, setEditorState]);

    useEffect(() => {
        if (editorState.moveFulcrumsEnabled) {
            return;
        }

        setDragState(null);
        clickToggleCandidateRef.current = null;
    }, [editorState.moveFulcrumsEnabled]);

    const getPointerPosition = useCallback((event) => {
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

        return {
            x: coords.x,
            y: coords.y
        };
    }, [containerRef, editorState.offset, editorState.scale, imageRect]);

    const setSelection = useCallback((nextIds) => {
        setEditorState((prev) => ({
            ...prev,
            selectedFulcrumIds: nextIds
        }));
    }, [setEditorState]);

    const handleFulcrumMoveStart = useCallback((fulcrum, event) => {
        if (!editorState.moveFulcrumsEnabled || event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isMultiSelectToggle = event.ctrlKey || event.metaKey;
        if (isMultiSelectToggle) {
            clickToggleCandidateRef.current = null;
            if (selectedIdSet.has(fulcrum.id)) {
                setSelection(selectedFulcrumIds.filter((id) => id !== fulcrum.id));
            } else {
                setSelection([...selectedFulcrumIds, fulcrum.id]);
            }
            return;
        }

        const pointerStart = getPointerPosition(event);
        if (!pointerStart) {
            return;
        }

        clickToggleCandidateRef.current = {
            id: fulcrum.id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            shouldToggle: selectedFulcrumIds.length === 1 && selectedIdSet.has(fulcrum.id)
        };

        const activeIds = selectedIdSet.has(fulcrum.id) && selectedFulcrumIds.length
            ? selectedFulcrumIds
            : [fulcrum.id];

        if (
            activeIds.length !== selectedFulcrumIds.length
            || activeIds.some((id) => !selectedIdSet.has(id))
        ) {
            setSelection(activeIds);
        }

        const startPositions = activeIds
            .map((id) => {
                const currentFulcrum = fulcrums.find((item) => item.id === id);
                if (!currentFulcrum) {
                    return null;
                }

                return {
                    id,
                    x: clamp01(currentFulcrum.x),
                    y: clamp01(currentFulcrum.y)
                };
            })
            .filter(Boolean);

        if (!startPositions.length) {
            return;
        }

        setDragState({
            activeIds,
            anchorId: fulcrum.id,
            pointerStart,
            startPositions,
            delta: { x: 0, y: 0 },
            hasMoved: false,
            isPersisting: false
        });
    }, [
        editorState.moveFulcrumsEnabled,
        fulcrums,
        getPointerPosition,
        selectedFulcrumIds,
        selectedIdSet,
        setSelection
    ]);

    useEffect(() => {
        if (!dragState || dragState.isPersisting) {
            return undefined;
        }

        const getClampedDelta = (rawDeltaX, rawDeltaY) => {
            const anchorStart = dragState.startPositions.find(
                (item) => item.id === dragState.anchorId
            );
            if (!anchorStart) {
                return { x: 0, y: 0 };
            }

            let nextDeltaX = rawDeltaX;
            let nextDeltaY = rawDeltaY;

            if (gridMetrics) {
                const offsetX = editorState.gridOffset?.x ?? 0;
                const offsetY = editorState.gridOffset?.y ?? 0;
                const snappedAnchorX = snapToGrid(
                    anchorStart.x + rawDeltaX - offsetX,
                    gridMetrics.stepXNorm
                ) + offsetX;
                const snappedAnchorY = snapToGrid(
                    anchorStart.y + rawDeltaY - offsetY,
                    gridMetrics.stepYNorm
                ) + offsetY;
                nextDeltaX = snappedAnchorX - anchorStart.x;
                nextDeltaY = snappedAnchorY - anchorStart.y;
            }

            const minDeltaX = Math.max(...dragState.startPositions.map((item) => -item.x));
            const maxDeltaX = Math.min(...dragState.startPositions.map((item) => 1 - item.x));
            const minDeltaY = Math.max(...dragState.startPositions.map((item) => -item.y));
            const maxDeltaY = Math.min(...dragState.startPositions.map((item) => 1 - item.y));

            return {
                x: Number(clampBetween(nextDeltaX, minDeltaX, maxDeltaX).toFixed(6)),
                y: Number(clampBetween(nextDeltaY, minDeltaY, maxDeltaY).toFixed(6))
            };
        };

        const handleMove = (event) => {
            const clickCandidate = clickToggleCandidateRef.current;
            if (clickCandidate?.shouldToggle) {
                const pointerDeltaX = event.clientX - clickCandidate.startClientX;
                const pointerDeltaY = event.clientY - clickCandidate.startClientY;
                if (Math.hypot(pointerDeltaX, pointerDeltaY) > 4) {
                    clickToggleCandidateRef.current = {
                        ...clickCandidate,
                        shouldToggle: false
                    };
                }
            }

            const pointer = getPointerPosition(event);
            if (!pointer) {
                return;
            }

            const rawDeltaX = pointer.x - dragState.pointerStart.x;
            const rawDeltaY = pointer.y - dragState.pointerStart.y;
            const nextDelta = getClampedDelta(rawDeltaX, rawDeltaY);

            setDragState((prev) => {
                if (!prev) {
                    return prev;
                }

                const hasMoved = prev.hasMoved
                    || Math.abs(nextDelta.x) > 0.0001
                    || Math.abs(nextDelta.y) > 0.0001;

                if (
                    prev.delta.x === nextDelta.x
                    && prev.delta.y === nextDelta.y
                    && prev.hasMoved === hasMoved
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    delta: nextDelta,
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

            clickToggleCandidateRef.current = null;
            setDragState((prev) => prev ? { ...prev, isPersisting: true } : prev);

            const updates = currentState.startPositions.map((item) => ({
                id: item.id,
                x: clamp01(item.x + currentState.delta.x),
                y: clamp01(item.y + currentState.delta.y)
            }));

            try {
                await onFulcrumsMove?.(updates);
            } catch (error) {
                const message = error?.response?.data?.message || error?.message || 'Unknown error';
                alert(`Failed to update point positions: ${message}`);
            } finally {
                clickToggleCandidateRef.current = null;
                setDragState(null);
            }
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp, true);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp, true);
        };
    }, [
        dragState,
        editorState.gridOffset,
        getPointerPosition,
        gridMetrics,
        onFulcrumsMove,
        snapToGrid
    ]);

    const handleFulcrumClick = useCallback((fulcrum, event) => {
        event.stopPropagation();

        if (!editorState.moveFulcrumsEnabled || event.ctrlKey || event.metaKey) {
            clickToggleCandidateRef.current = null;
            return;
        }

        const candidate = clickToggleCandidateRef.current;
        clickToggleCandidateRef.current = null;

        if (
            candidate?.shouldToggle
            && candidate.id === fulcrum.id
            && selectedFulcrumIds.length === 1
            && selectedIdSet.has(fulcrum.id)
        ) {
            setSelection([]);
        }
    }, [
        editorState.moveFulcrumsEnabled,
        selectedFulcrumIds,
        selectedIdSet,
        setSelection
    ]);

    const effectiveFulcrums = useMemo(() => {
        if (!dragState) {
            return fulcrums;
        }

        const positionsById = new Map(
            dragState.startPositions.map((item) => [
                item.id,
                {
                    x: clamp01(item.x + dragState.delta.x),
                    y: clamp01(item.y + dragState.delta.y)
                }
            ])
        );

        return fulcrums.map((fulcrum) => {
            const nextPosition = positionsById.get(fulcrum.id);
            if (!nextPosition) {
                return fulcrum;
            }

            return {
                ...fulcrum,
                x: nextPosition.x,
                y: nextPosition.y
            };
        });
    }, [dragState, fulcrums]);

    return {
        effectiveFulcrums,
        selectedFulcrumIds,
        isMovingFulcrum: Boolean(dragState),
        movingFulcrumIds: dragState?.activeIds ?? [],
        handleFulcrumMoveStart,
        handleFulcrumClick
    };
};

export default useFulcrumMove;
