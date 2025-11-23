import React, { useRef, useEffect, useState, useCallback } from 'react';
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

    // Отслеживание размеров контейнера
    const updateSize = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            console.log('📐 SvgCanvas container size:', { width, height });

            if (width > 0 && height > 0) {
                updateContainerSize?.(width, height);
            }
        }
    }, [updateContainerSize]);

    // Обновляем размеры при монтировании и изменении размеров
    useEffect(() => {
        console.log('🔧 SvgCanvas mounted, setting up resize tracking');
        updateSize();

        const handleResize = () => {
            console.log('🔄 Window resized, updating container size');
            updateSize();
        };

        window.addEventListener('resize', handleResize);

        // Периодически проверяем размеры в течение первых 3 секунд
        const initialCheckInterval = setInterval(updateSize, 100);
        const timeout = setTimeout(() => {
            clearInterval(initialCheckInterval);
        }, 3000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(initialCheckInterval);
            clearTimeout(timeout);
        };
    }, [updateSize]);

    // Обновляем размеры при изменении видимости или содержимого
    useEffect(() => {
        if (editorState.svgContent) {
            console.log('🔄 SVG content changed, updating container size');
            // Даем время на рендеринг, затем обновляем размеры
            const timer = setTimeout(updateSize, 100);
            return () => clearTimeout(timer);
        }
    }, [editorState.svgContent, updateSize]);

    // Обработка контекстного меню для создания fulcrum
    const handleContextMenu = (e) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container || !editorState.svgContent) return;

        const relativeCoords = getRelativeCoordinates(e, container, editorState.offset, editorState.scale);

        if (onFulcrumCreate) {
            onFulcrumCreate(relativeCoords, e);
        }
    };

    // Обработка начала перетаскивания для создания связи
    const handleFulcrumDragStart = (fulcrum, e) => {
        e.stopPropagation();

        const container = containerRef.current;
        const coords = getRelativeCoordinates(e, container, editorState.offset, editorState.scale);

        setIsCreatingConnection(true);
        setTempConnection({
            from: fulcrum,
            fromPos: coords,
            toPos: coords
        });
    };

    // Обработка движения мыши при создании связи
    const handleMouseMove = (e) => {
        if (isCreatingConnection && tempConnection) {
            const container = containerRef.current;
            const coords = getRelativeCoordinates(e, container, editorState.offset, editorState.scale);

            setTempConnection(prev => ({
                ...prev,
                toPos: coords
            }));
        }
    };

    // Обработка отпускания кнопки мыши для завершения связи
    const handleMouseUp = (e) => {
        if (isCreatingConnection && tempConnection) {
            const container = containerRef.current;
            const coords = getRelativeCoordinates(e, container, editorState.offset, editorState.scale);

            // Ищем fulcrum под курсором
            const targetFulcrum = fulcrums.find(fulcrum => {
                const displayPos = getFulcrumDisplayPosition(fulcrum, editorState.offset, editorState.scale);
                const distance = Math.sqrt(
                    Math.pow(coords.x - fulcrum.x, 2) + Math.pow(coords.y - fulcrum.y, 2)
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

    // Обработка нажатия мыши на канвасе
    const handleMouseDown = (e) => {
        if (isCreatingConnection) {
            e.preventDefault();
            return;
        }

        handleCanvasMouseDown(e);
    };

    // Обработчик контекстного меню для связей
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

            // Проверяем есть ли обратная связь
            const reverseConnection = connections.find(conn =>
                conn.from === connection.to && conn.to === connection.from
            );

            if (!processedPairs.has(pairKey)) {
                if (reverseConnection) {
                    // Двунаправленная связь - одна группа
                    grouped.push({
                        type: 'bidirectional',
                        connections: [connection, reverseConnection],
                        from: connection.from,
                        to: connection.to,
                        weights: [connection.weight, reverseConnection.weight]
                    });
                } else {
                    // Однонаправленная связь
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

    const groupedConnections = getGroupedConnections();

    // Добавляем обработчики wheel и mouse move
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
                    {/* Основной контейнер для карты, точек и соединений с общими трансформациями */}
                    <div
                        className="canvas-content-wrapper"
                        style={{
                            transform: `translate(${editorState.offset.x}px, ${editorState.offset.y}px) scale(${editorState.scale})`,
                            transformOrigin: '0 0'
                        }}
                    >
                        {/* Карта */}
                        <SvgContent
                            svgContent={editorState.svgContent}
                            isDragging={editorState.isDragging}
                        />

                        {/* Временная связь при создании - ПЕРЕМЕЩАЕМ ВНУТРЬ трансформируемого контейнера */}
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

                        {/* Overlay для fulcrums и connections */}
                        <div className="fulcrums-overlay">
                            {/* 1. Сначала все линии и стрелочки */}
                            {groupedConnections.map((group, index) => {
                                const fromFulcrum = fulcrums.find(f => f.id === group.from);
                                const toFulcrum = fulcrums.find(f => f.id === group.to);
                                if (!fromFulcrum || !toFulcrum) return null;

                                return (
                                    <FulcrumConnection
                                        key={`line-${group.from}-${group.to}-${index}`}
                                        connection={group.connections[0]} // Передаем первую связь для данных
                                        fromFulcrum={fromFulcrum}
                                        toFulcrum={toFulcrum}
                                        weight={group.weights[0]}
                                        isHovered={hoveredConnection === group.connections[0]}
                                        connectionType={group.type} // Передаем тип связи
                                        onMouseEnter={() => setHoveredConnection(group.connections[0])}
                                        onMouseLeave={() => setHoveredConnection(null)}
                                        onContextMenu={handleConnectionContextMenu}
                                        showWeight={false}
                                    />
                                );
                            })}

                            {/* 2. Затем веса */}
                            {groupedConnections.map((group, index) => {
                                const fromFulcrum = fulcrums.find(f => f.id === group.from);
                                const toFulcrum = fulcrums.find(f => f.id === group.to);
                                if (!fromFulcrum || !toFulcrum) return null;

                                if (group.type === 'bidirectional') {
                                    // Правильно определяем какой вес к какому направлению
                                    const connectionAtoB = group.connections.find(conn => conn.from === group.from && conn.to === group.to);
                                    const connectionBtoA = group.connections.find(conn => conn.from === group.to && conn.to === group.from);

                                    return (
                                        <>
                                            {/* Вес для направления A→B (ближе к A) */}
                                            <div
                                                key={`weight-${group.from}-${group.to}-A`}
                                                className="connection-weight-standalone"
                                                style={{
                                                    left: `${fromFulcrum.x + (toFulcrum.x - fromFulcrum.x) * 0.7}px`,
                                                    top: `${fromFulcrum.y + (toFulcrum.y - fromFulcrum.y) * 0.7}px`,
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
                                            {/* Вес для направления B→A (ближе к B) */}
                                            <div
                                                key={`weight-${group.from}-${group.to}-B`}
                                                className="connection-weight-standalone"
                                                style={{
                                                    left: `${fromFulcrum.x + (toFulcrum.x - fromFulcrum.x) * 0.3}px`,
                                                    top: `${fromFulcrum.y + (toFulcrum.y - fromFulcrum.y) * 0.3}px`,
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
                                        </>
                                    );
                                } else {
                                    // Для однонаправленных - один квадратик
                                    return (
                                        <div
                                            key={`weight-${group.from}-${group.to}`}
                                            className="connection-weight-standalone"
                                            style={{
                                                left: `${fromFulcrum.x + (toFulcrum.x - fromFulcrum.x) * 0.7}px`,
                                                top: `${fromFulcrum.y + (toFulcrum.y - fromFulcrum.y) * 0.7}px`,
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

                            {/* 3. Точки fulcrum - самые верхние */}
                            {fulcrums.map(fulcrum => (
                                <FulcrumPoint
                                    key={fulcrum.id}
                                    fulcrum={fulcrum}
                                    isHovered={hoveredFulcrum?.id === fulcrum.id}
                                    onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                                    onMouseLeave={() => setHoveredFulcrum(null)}
                                    onContextMenu={(fulcrum, e) => onFulcrumContextMenu && onFulcrumContextMenu(fulcrum, e)}
                                    onDragStart={handleFulcrumDragStart}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SvgCanvas;