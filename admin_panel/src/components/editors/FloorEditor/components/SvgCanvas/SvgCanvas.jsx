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

    const {
        handleMouseDown: handleCanvasMouseDown,
        handleWheel
    } = useSvgCanvas(editorState, setEditorState);

    const updateSize = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            if (width > 0 && height > 0) {
                updateContainerSize?.(width, height);
            }
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
        if (editorState.svgContent) {
            const timer = setTimeout(updateSize, 100);
            return () => clearTimeout(timer);
        }
    }, [editorState.svgContent, updateSize]);

    const handleContextMenu = (e) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container || !editorState.svgContent) return;

        const relativeCoords = getRelativeCoordinates(
            e,
            container,
            editorState.offset,
            editorState.scale,
            svgSize
        );

        if (onFulcrumCreate) {
            onFulcrumCreate({ x: relativeCoords.x, y: relativeCoords.y }, e);
        }
    };

    const handleFulcrumDragStart = (fulcrum, e) => {
        e.stopPropagation();

        const container = containerRef.current;
        const coords = getRelativeCoordinates(
            e,
            container,
            editorState.offset,
            editorState.scale,
            svgSize
        );

        setIsCreatingConnection(true);
        setTempConnection({
            from: fulcrum,
            fromPos: { x: coords.svgX, y: coords.svgY },
            toPos: { x: coords.svgX, y: coords.svgY }
        });
    };

    const handleMouseMove = (e) => {
        if (isCreatingConnection && tempConnection) {
            const container = containerRef.current;
            const coords = getRelativeCoordinates(
                e,
                container,
                editorState.offset,
                editorState.scale,
                svgSize
            );

            setTempConnection(prev => ({
                ...prev,
                toPos: { x: coords.svgX, y: coords.svgY }
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (isCreatingConnection && tempConnection) {
            const container = containerRef.current;
            const coords = getRelativeCoordinates(
                e,
                container,
                editorState.offset,
                editorState.scale,
                svgSize
            );

            const targetFulcrum = fulcrums.find(fulcrum => {
                const displayPos = getFulcrumDisplayPosition(
                    fulcrum,
                    editorState.offset,
                    editorState.scale,
                    svgSize
                );
                const distance = Math.sqrt(
                    Math.pow(coords.svgX - displayPos.x, 2) +
                    Math.pow(coords.svgY - displayPos.y, 2)
                );
                return distance < 30 / editorState.scale;
            });

            if (targetFulcrum && targetFulcrum.id !== tempConnection.from.id) {
                if (onConnectionCreate) {
                    onConnectionCreate(tempConnection.from, targetFulcrum);
                }
            }

            setTempConnection(null);
            setIsCreatingConnection(false);
        }
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
        if (onConnectionContextMenu) {
            onConnectionContextMenu(connection, event);
        }
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

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelWithOptions = (e) => {
            handleWheel(e);
        };

        container.addEventListener('wheel', handleWheelWithOptions, { passive: false });
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('wheel', handleWheelWithOptions);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleWheel, isCreatingConnection, tempConnection]);

    return (
        <div
            ref={containerRef}
            className={`svg-canvas ${editorState.isDragging ? 'dragging' : ''} ${isCreatingConnection ? 'creating-connection' : ''}`}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
        >
            {!editorState.svgContent ? (
                <CanvasBackground />
            ) : (
                <>
                    <div
                        className="canvas-content-wrapper"
                        style={{
                            transform: `translate(${editorState.offset.x}px, ${editorState.offset.y}px) scale(${editorState.scale})`,
                            transformOrigin: '0 0'
                        }}
                    >
                        <SvgContent
                            svgContent={editorState.svgContent}
                            isDragging={editorState.isDragging}
                        />

                        {tempConnection && (
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
                        )}

                        <div className="fulcrums-overlay">
                            {groupedConnections.map((group, index) => {
                                const fromFulcrum = fulcrums.find(f => f.id === group.from);
                                const toFulcrum = fulcrums.find(f => f.id === group.to);
                                if (!fromFulcrum || !toFulcrum) return null;

                                const fromPos = getFulcrumDisplayPosition(
                                    fromFulcrum,
                                    editorState.offset,
                                    editorState.scale,
                                    svgSize
                                );
                                const toPos = getFulcrumDisplayPosition(
                                    toFulcrum,
                                    editorState.offset,
                                    editorState.scale,
                                    svgSize
                                );

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

                                const fromPos = getFulcrumDisplayPosition(
                                    fromFulcrum,
                                    editorState.offset,
                                    editorState.scale,
                                    svgSize
                                );
                                const toPos = getFulcrumDisplayPosition(
                                    toFulcrum,
                                    editorState.offset,
                                    editorState.scale,
                                    svgSize
                                );

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
                                                    transform: 'translate(-50%, -50%)',
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
                                                    transform: 'translate(-50%, -50%)',
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
                                } else {
                                    return (
                                        <div
                                            key={`weight-${group.from}-${group.to}`}
                                            className="connection-weight-standalone"
                                            style={{
                                                left: `${fromPos.x + (toPos.x - fromPos.x) * 0.7}px`,
                                                top: `${fromPos.y + (toPos.y - fromPos.y) * 0.7}px`,
                                                position: 'absolute',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 25
                                            }}
                                            onMouseEnter={() => setHoveredConnection(group.connections[0])}
                                            onMouseLeave={() => setHoveredConnection(null)}
                                            onContextMenu={(e) => handleConnectionContextMenu(group.connections[0], e)}
                                        >
                                            {group.weights[0]}
                                        </div>
                                    );
                                }
                            })}

                            {fulcrums.map(fulcrum => {
                                const displayPos = getFulcrumDisplayPosition(
                                    fulcrum,
                                    editorState.offset,
                                    editorState.scale,
                                    svgSize
                                );

                                return (
                                    <FulcrumPoint
                                        key={fulcrum.id}
                                        fulcrum={fulcrum}
                                        position={displayPos}
                                        isHovered={hoveredFulcrum?.id === fulcrum.id}
                                        onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                                        onMouseLeave={() => setHoveredFulcrum(null)}
                                        onContextMenu={(f, e) => onFulcrumContextMenu && onFulcrumContextMenu(f, e)}
                                        onDragStart={handleFulcrumDragStart}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SvgCanvas;
