import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSvgCanvas } from '../../hooks';
import CanvasBackground from '../CanvasBackground/CanvasBackground';
import SvgContent from '../SvgContent/SvgContent';
import FulcrumPoint from '../FulcrumPoint/FulcrumPoint';
import FulcrumConnection from '../FulcrumConnection/FulcrumConnection';
import { getRelativeCoordinates, getFulcrumDisplayPosition } from '../../hooks';
import './SvgCanvas.css';

const SvgCanvas = ({
    editorState,
    setEditorState,
    fulcrums,
    connections,
    svgSize,
    onFulcrumCreate,
    onFulcrumContextMenu,
    onConnectionCreate,
    onConnectionContextMenu,
    updateContainerSize
}) => {
    const containerRef = useRef(null);
    const [hoveredFulcrum, setHoveredFulcrum] = useState(null);
    const [hoveredConnection, setHoveredConnection] = useState(null);
    const [tempConnection, setTempConnection] = useState(null);
    const [isCreatingConnection, setIsCreatingConnection] = useState(false);
    const [isGridDragging, setIsGridDragging] = useState(false);
    const [gridDragState, setGridDragState] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const bodyCursorRef = useRef(null);
    const bodyUserSelectRef = useRef(null);
    const gridHandleRef = useRef(null);
    const lastGridClickRef = useRef(0);
    const lastPointerUnlockRef = useRef(0);
    const uiScale = useMemo(() => {
        const scaleValue = editorState.scale || 1;
        const inverse = 1 / scaleValue;
        return Math.max(0.6, Math.min(1.6, inverse));
    }, [editorState.scale]);

    const {
        handleMouseDown: handleCanvasMouseDown,
        handleWheel
    } = useSvgCanvas(editorState, setEditorState);

    const snapToGrid = useCallback((value, step) => {
        if (!Number.isFinite(step) || step <= 0) return value;
        const snapped = Math.round(value / step) * step;
        const clamped = Math.min(1, Math.max(0, snapped));
        return Number(clamped.toFixed(6));
    }, []);

    const wrapOffset = useCallback((value, step) => {
        if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
            return 0;
        }
        let wrapped = value % step;
        if (wrapped < 0) wrapped += step;
        return Number(wrapped.toFixed(6));
    }, []);

    const updateSize = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (width > 0 && height > 0) {
            updateContainerSize?.(width, height);
            setCanvasSize({ width, height });
        }
    }, [updateContainerSize]);

    useEffect(() => {
        updateSize();

        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => updateSize());
        resizeObserver.observe(container);

        const handleResize = () => updateSize();
        window.addEventListener('resize', handleResize);

        const viewport = window.visualViewport;
        const handleViewportResize = () => updateSize();
        viewport?.addEventListener('resize', handleViewportResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            viewport?.removeEventListener('resize', handleViewportResize);
        };
    }, [updateSize]);

    useEffect(() => {
        if (!editorState.svgContent) return;
        const timer = setTimeout(updateSize, 100);
        return () => clearTimeout(timer);
    }, [editorState.svgContent, updateSize]);

    const imageRect = useMemo(() => {
        if (!canvasSize.width || !canvasSize.height) {
            return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
        }

        const imageWidth = svgSize?.width || canvasSize.width;
        const imageHeight = svgSize?.height || canvasSize.height;

        const scale = Math.min(canvasSize.width / imageWidth, canvasSize.height / imageHeight);
        const displayWidth = imageWidth * scale;
        const displayHeight = imageHeight * scale;
        const offsetX = (canvasSize.width - displayWidth) / 2;
        const offsetY = (canvasSize.height - displayHeight) / 2;

        return {
            width: displayWidth,
            height: displayHeight,
            offsetX,
            offsetY
        };
    }, [canvasSize.width, canvasSize.height, svgSize]);

    const gridMetrics = useMemo(() => {
        if (!editorState.gridEnabled || !Number.isFinite(editorState.gridStep)) {
            return null;
        }
        if (!imageRect.width || !imageRect.height) {
            return null;
        }
        const baseSize = Math.min(imageRect.width, imageRect.height);
        const stepPx = baseSize * editorState.gridStep;
        if (!Number.isFinite(stepPx) || stepPx <= 0) {
            return null;
        }
        return {
            stepPx,
            stepX: stepPx,
            stepY: stepPx,
            stepXNorm: stepPx / imageRect.width,
            stepYNorm: stepPx / imageRect.height
        };
    }, [editorState.gridEnabled, editorState.gridStep, imageRect]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;

        const relativeCoords = getRelativeCoordinates(
            e,
            container,
            imageRect,
            editorState.offset,
            editorState.scale
        );

        let nextX = relativeCoords.x;
        let nextY = relativeCoords.y;

        if (gridMetrics) {
            const offsetX = editorState.gridOffset?.x ?? 0;
            const offsetY = editorState.gridOffset?.y ?? 0;
            nextX = snapToGrid(nextX - offsetX, gridMetrics.stepXNorm) + offsetX;
            nextY = snapToGrid(nextY - offsetY, gridMetrics.stepYNorm) + offsetY;
            nextX = Math.min(1, Math.max(0, nextX));
            nextY = Math.min(1, Math.max(0, nextY));
        }

        onFulcrumCreate?.({ x: nextX, y: nextY }, e);
    };

    const handleGridHandleMouseDown = (e) => {
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
    };

    const handleGridReset = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditorState(prev => ({
            ...prev,
            gridOffset: { x: 0, y: 0 }
        }));
    };

    const handleFulcrumDragStart = (fulcrum, e) => {
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
    };

    const handleMouseMove = (e) => {
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
    };

    const handleMouseUp = (e) => {
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
    };

    const handleMouseDown = (e) => {
        if (isCreatingConnection) {
            e.preventDefault();
            return;
        }
        handleCanvasMouseDown(e);
    };

    const handleConnectionContextMenu = (connection, event) => {
        event.preventDefault();
        event.stopPropagation();
        onConnectionContextMenu?.(connection, event);
    };

    const getGroupedConnections = useCallback(() => {
        const grouped = [];
        const processedPairs = new Set();

        connections.forEach(connection => {
            const pairKey = [connection.from, connection.to].sort().join('-');
            const reverseConnection = connections.find(conn =>
                conn.from === connection.to && conn.to === connection.from
            );

            if (!processedPairs.has(pairKey)) {
                if (reverseConnection) {
                    grouped.push({
                        type: 'bidirectional',
                        connections: [connection, reverseConnection],
                        from: connection.from,
                        to: connection.to,
                        weights: [connection.weight, reverseConnection.weight]
                    });
                } else {
                    grouped.push({
                        type: 'unidirectional',
                        connections: [connection],
                        from: connection.from,
                        to: connection.to,
                        weights: [connection.weight]
                    });
                }
                processedPairs.add(pairKey);
            }
        });

        return grouped;
    }, [connections]);

    const groupedConnections = useMemo(() => getGroupedConnections(), [getGroupedConnections]);

    const gridStyle = useMemo(() => {
        if (!gridMetrics) {
            return null;
        }
        const offsetX = (editorState.gridOffset?.x ?? 0) * imageRect.width;
        const offsetY = (editorState.gridOffset?.y ?? 0) * imageRect.height;
        return {
            left: `${imageRect.offsetX}px`,
            top: `${imageRect.offsetY}px`,
            width: `${imageRect.width}px`,
            height: `${imageRect.height}px`,
            '--grid-step-x': `${gridMetrics.stepX}px`,
            '--grid-step-y': `${gridMetrics.stepY}px`,
            '--grid-major-step-x': `${gridMetrics.stepPx * 5}px`,
            '--grid-major-step-y': `${gridMetrics.stepPx * 5}px`,
            '--grid-offset-x': `${offsetX}px`,
            '--grid-offset-y': `${offsetY}px`
        };
    }, [gridMetrics, imageRect, editorState.gridOffset]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelWithOptions = (e) => handleWheel(e);

        container.addEventListener('wheel', handleWheelWithOptions, { passive: false });
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp, true);

        return () => {
            container.removeEventListener('wheel', handleWheelWithOptions);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp, true);
        };
    }, [handleWheel, handleMouseMove, handleMouseUp]);

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
        wrapOffset
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

    return (
        <div
            ref={containerRef}
            className={`svg-canvas ${editorState.isDragging ? 'dragging' : ''} ${isCreatingConnection ? 'creating-connection' : ''} ${isGridDragging ? 'grid-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
        >
            {!editorState.svgContent ? <CanvasBackground /> : null}
            {editorState.gridEnabled ? (
                <div
                    className={`grid-handle${isGridDragging ? ' is-dragging' : ''}`}
                    onMouseDown={handleGridHandleMouseDown}
                    onDoubleClick={handleGridReset}
                    title="Сдвиг сетки (двойной клик — сброс)"
                    ref={gridHandleRef}
                >
                    <span className="grid-handle-icon">⇕⇔</span>
                    <span className="grid-handle-text">Сдвиг сетки</span>
                </div>
            ) : null}
            <div
                className="canvas-content-wrapper"
                style={{
                    transform: `translate(${editorState.offset.x}px, ${editorState.offset.y}px) scale(${editorState.scale})`,
                    transformOrigin: '0 0'
                }}
            >
                {editorState.svgContent ? (
                    <div
                        className="canvas-image-layer"
                        style={{
                            left: `${imageRect.offsetX}px`,
                            top: `${imageRect.offsetY}px`,
                            width: `${imageRect.width}px`,
                            height: `${imageRect.height}px`
                        }}
                    >
                        <SvgContent
                            svgContent={editorState.svgContent}
                            isDragging={editorState.isDragging}
                        />
                    </div>
                ) : null}
                {gridStyle ? (
                    <div className="grid-overlay" style={gridStyle} />
                ) : null}
                {tempConnection ? (
                    <div className="temp-connection">
                        <svg className="connection-svg">
                            <line
                                x1={tempConnection.fromPos.x}
                                y1={tempConnection.fromPos.y}
                                x2={tempConnection.toPos.x}
                                y2={tempConnection.toPos.y}
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                            />
                        </svg>
                    </div>
                ) : null}

                <div className="fulcrums-overlay">
                    {groupedConnections.map((group, index) => {
                        const fromFulcrum = fulcrums.find(f => f.id === group.from);
                        const toFulcrum = fulcrums.find(f => f.id === group.to);
                        if (!fromFulcrum || !toFulcrum) return null;

                        const fromPos = getFulcrumDisplayPosition(fromFulcrum, imageRect);
                        const toPos = getFulcrumDisplayPosition(toFulcrum, imageRect);

                        return (
                            <FulcrumConnection
                                key={`line-${group.from}-${group.to}-${index}`}
                                connection={group.connections[0]}
                                fromFulcrum={fromPos}
                                toFulcrum={toPos}
                                weight={group.weights[0]}
                                isHovered={hoveredConnection === group.connections[0]}
                                connectionType={group.type}
                                onMouseEnter={() => setHoveredConnection(group.connections[0])}
                                onMouseLeave={() => setHoveredConnection(null)}
                                onContextMenu={handleConnectionContextMenu}
                                showWeight={false}
                            />
                        );
                    })}

                    {groupedConnections.map((group, index) => {
                        const fromFulcrum = fulcrums.find(f => f.id === group.from);
                        const toFulcrum = fulcrums.find(f => f.id === group.to);
                        if (!fromFulcrum || !toFulcrum) return null;

                        const fromPos = getFulcrumDisplayPosition(fromFulcrum, imageRect);
                        const toPos = getFulcrumDisplayPosition(toFulcrum, imageRect);

                        if (group.type === 'bidirectional') {
                            const connectionAtoB = group.connections.find(conn => conn.from === group.from && conn.to === group.to);
                            const connectionBtoA = group.connections.find(conn => conn.from === group.to && conn.to === group.from);

                            return (
                                <React.Fragment key={`weights-${group.from}-${group.to}-${index}`}>
                                    <div
                                        className="connection-weight-standalone"
                                        style={{
                                            left: `${fromPos.x + (toPos.x - fromPos.x) * 0.7}px`,
                                            top: `${fromPos.y + (toPos.y - fromPos.y) * 0.7}px`,
                                            position: 'absolute',
                                            transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                                            '--weight-scale': uiScale,
                                            zIndex: 25
                                        }}
                                        onMouseEnter={() => setHoveredConnection(connectionAtoB)}
                                        onMouseLeave={() => setHoveredConnection(null)}
                                        onContextMenu={(e) => handleConnectionContextMenu(connectionAtoB, e)}
                                    >
                                        {connectionAtoB?.weight}
                                    </div>
                                    <div
                                        className="connection-weight-standalone"
                                        style={{
                                            left: `${fromPos.x + (toPos.x - fromPos.x) * 0.3}px`,
                                            top: `${fromPos.y + (toPos.y - fromPos.y) * 0.3}px`,
                                            position: 'absolute',
                                            transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                                            '--weight-scale': uiScale,
                                            zIndex: 25
                                        }}
                                        onMouseEnter={() => setHoveredConnection(connectionBtoA)}
                                        onMouseLeave={() => setHoveredConnection(null)}
                                        onContextMenu={(e) => handleConnectionContextMenu(connectionBtoA, e)}
                                    >
                                        {connectionBtoA?.weight}
                                    </div>
                                </React.Fragment>
                            );
                        }

                        return (
                            <div
                                key={`weight-${group.from}-${group.to}`}
                                className="connection-weight-standalone"
                                style={{
                                    left: `${fromPos.x + (toPos.x - fromPos.x) * 0.7}px`,
                                    top: `${fromPos.y + (toPos.y - fromPos.y) * 0.7}px`,
                                    position: 'absolute',
                                    transform: 'translate(-50%, -50%) scale(var(--weight-scale, 1))',
                                    '--weight-scale': uiScale,
                                    zIndex: 25
                                }}
                                onMouseEnter={() => setHoveredConnection(group.connections[0])}
                                onMouseLeave={() => setHoveredConnection(null)}
                                onContextMenu={(e) => handleConnectionContextMenu(group.connections[0], e)}
                            >
                                {group.weights[0]}
                            </div>
                        );
                    })}

                    {fulcrums.map(fulcrum => {
                        const displayPos = getFulcrumDisplayPosition(fulcrum, imageRect);

                        return (
                            <FulcrumPoint
                                key={fulcrum.id}
                                fulcrum={fulcrum}
                                position={displayPos}
                                isHovered={hoveredFulcrum?.id === fulcrum.id}
                                uiScale={uiScale}
                                onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                                onMouseLeave={() => setHoveredFulcrum(null)}
                                onContextMenu={(f, e) => onFulcrumContextMenu && onFulcrumContextMenu(f, e)}
                                onDragStart={handleFulcrumDragStart}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SvgCanvas;
