import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSvgCanvas } from '../../hooks';
import CanvasBackground from '../CanvasBackground/CanvasBackground';
import SvgContent from '../SvgContent/SvgContent';
import ConnectionsLayer from './components/ConnectionsLayer';
import ConnectionWeightsLayer from './components/ConnectionWeightsLayer';
import FulcrumsLayer from './components/FulcrumsLayer';
import useCanvasSize from './hooks/useCanvasSize';
import useConnectionDrag from './hooks/useConnectionDrag';
import useGridDrag from './hooks/useGridDrag';
import { getRelativeCoordinates } from '../../hooks';
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
    const { canvasSize } = useCanvasSize({
        containerRef,
        svgContent: editorState.svgContent,
        updateContainerSize
    });

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

    const {
        isGridDragging,
        gridHandleRef,
        handleGridHandleMouseDown,
        handleGridReset
    } = useGridDrag({
        containerRef,
        editorState,
        setEditorState,
        gridMetrics,
        imageRect,
        wrapOffset
    });

    const {
        isCreatingConnection,
        tempConnection,
        handleFulcrumDragStart,
        handleMouseMove,
        handleMouseUp,
        handleMouseDown
    } = useConnectionDrag({
        containerRef,
        editorState,
        imageRect,
        fulcrums,
        onConnectionCreate,
        handleCanvasMouseDown
    });

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


    const handleConnectionContextMenu = (connection, event) => {
        event.preventDefault();
        event.stopPropagation();
        onConnectionContextMenu?.(connection, event);
    };

    const isSameConnection = useCallback((a, b) => {
        if (!a || !b) return false;
        return a.from === b.from && a.to === b.to;
    }, []);

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
                    <ConnectionsLayer
                        groupedConnections={groupedConnections}
                        fulcrums={fulcrums}
                        imageRect={imageRect}
                        hoveredConnection={hoveredConnection}
                        setHoveredConnection={setHoveredConnection}
                        onConnectionContextMenu={handleConnectionContextMenu}
                        isSameConnection={isSameConnection}
                    />
                    <ConnectionWeightsLayer
                        groupedConnections={groupedConnections}
                        fulcrums={fulcrums}
                        imageRect={imageRect}
                        hoveredConnection={hoveredConnection}
                        setHoveredConnection={setHoveredConnection}
                        onConnectionContextMenu={handleConnectionContextMenu}
                        isSameConnection={isSameConnection}
                        uiScale={uiScale}
                    />
                    <FulcrumsLayer
                        fulcrums={fulcrums}
                        imageRect={imageRect}
                        hoveredFulcrum={hoveredFulcrum}
                        setHoveredFulcrum={setHoveredFulcrum}
                        uiScale={uiScale}
                        onFulcrumContextMenu={onFulcrumContextMenu}
                        onFulcrumDragStart={handleFulcrumDragStart}
                    />
                </div>
            </div>
        </div>
    );
};

export default SvgCanvas;
