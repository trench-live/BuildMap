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
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
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
            nextX = snapToGrid(nextX, gridMetrics.stepXNorm);
            nextY = snapToGrid(nextY, gridMetrics.stepYNorm);
        }

        onFulcrumCreate?.({ x: nextX, y: nextY }, e);
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
        return {
            left: `${imageRect.offsetX}px`,
            top: `${imageRect.offsetY}px`,
            width: `${imageRect.width}px`,
            height: `${imageRect.height}px`,
            '--grid-step-x': `${gridMetrics.stepX}px`,
            '--grid-step-y': `${gridMetrics.stepY}px`,
            '--grid-major-step-x': `${gridMetrics.stepPx * 5}px`,
            '--grid-major-step-y': `${gridMetrics.stepPx * 5}px`
        };
    }, [gridMetrics, imageRect]);

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

    return (
        <div
            ref={containerRef}
            className={`svg-canvas ${editorState.isDragging ? 'dragging' : ''} ${isCreatingConnection ? 'creating-connection' : ''}`}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
        >
            {!editorState.svgContent ? <CanvasBackground /> : null}
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
