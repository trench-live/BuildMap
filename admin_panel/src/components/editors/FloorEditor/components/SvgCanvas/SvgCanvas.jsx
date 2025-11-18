import React, { useRef, useEffect, useState } from 'react';
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
                       onConnectionContextMenu
                   }) => {
    const containerRef = useRef(null);
    const [hoveredFulcrum, setHoveredFulcrum] = useState(null);
    const [tempConnection, setTempConnection] = useState(null);
    const [isCreatingConnection, setIsCreatingConnection] = useState(false);

    const {
        handleMouseDown: handleCanvasMouseDown,
        handleWheel
    } = useSvgCanvas(editorState, setEditorState);

    // Обработка контекстного меню для создания fulcrum
    const handleContextMenu = (e) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container || !editorState.svgContent) return;

        const relativeCoords = getRelativeCoordinates(e, container, editorState.offset, editorState.scale);

        // Вызываем callback для создания fulcrum
        if (onFulcrumCreate) {
            onFulcrumCreate(relativeCoords, e);
        }
    };

    // Обработка начала перетаскивания для создания связи
    const handleFulcrumDragStart = (fulcrum, e) => {
        e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал handleCanvasMouseDown

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
                return distance < 30 / editorState.scale; // Радиус попадания с учетом масштаба
            });

            if (targetFulcrum && targetFulcrum.id !== tempConnection.from.id) {
                // Вызываем callback для создания связи
                if (onConnectionCreate) {
                    onConnectionCreate(tempConnection.from, targetFulcrum);
                }
            }

            // Сбрасываем состояние
            setTempConnection(null);
            setIsCreatingConnection(false);
        }
    };

    // Обработка нажатия мыши на канвасе
    const handleMouseDown = (e) => {
        // Если создаем связь, не даем канвасу перетаскиваться
        if (isCreatingConnection) {
            e.preventDefault();
            return;
        }

        // Иначе обрабатываем как обычное перетаскивание канваса
        handleCanvasMouseDown(e);
    };

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
                    <SvgContent
                        svgContent={editorState.svgContent}
                        offset={editorState.offset}
                        scale={editorState.scale}
                        isDragging={editorState.isDragging}
                    />

                    {/* Overlay для fulcrums и connections */}
                    <div className="fulcrums-overlay">
                        {/* Временная связь при создании */}
                        {tempConnection && (
                            <div className="temp-connection">
                                <svg className="connection-svg">
                                    <line
                                        x1={tempConnection.fromPos.x * editorState.scale + editorState.offset.x}
                                        y1={tempConnection.fromPos.y * editorState.scale + editorState.offset.y}
                                        x2={tempConnection.toPos.x * editorState.scale + editorState.offset.x}
                                        y2={tempConnection.toPos.y * editorState.scale + editorState.offset.y}
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        strokeDasharray="4,4"
                                    />
                                </svg>
                            </div>
                        )}

                        {/* Постоянные связи */}
                        {connections.map((connection, index) => {
                            const fromFulcrum = fulcrums.find(f => f.id === connection.from);
                            const toFulcrum = fulcrums.find(f => f.id === connection.to);

                            if (!fromFulcrum || !toFulcrum) return null;

                            const fromPos = getFulcrumDisplayPosition(fromFulcrum, editorState.offset, editorState.scale);
                            const toPos = getFulcrumDisplayPosition(toFulcrum, editorState.offset, editorState.scale);

                            return (
                                <FulcrumConnection
                                    key={`${connection.from}-${connection.to}-${index}`}
                                    from={fromPos}
                                    to={toPos}
                                    weight={connection.weight}
                                    onContextMenu={(e) => onConnectionContextMenu && onConnectionContextMenu(connection, e)}
                                />
                            );
                        })}

                        {/* Точки fulcrum */}
                        {fulcrums.map(fulcrum => {
                            const position = getFulcrumDisplayPosition(fulcrum, editorState.offset, editorState.scale);

                            return (
                                <FulcrumPoint
                                    key={fulcrum.id}
                                    fulcrum={fulcrum}
                                    position={position}
                                    isSelected={editorState.selectedFulcrum?.id === fulcrum.id}
                                    isHovered={hoveredFulcrum?.id === fulcrum.id}
                                    onMouseEnter={() => setHoveredFulcrum(fulcrum)}
                                    onMouseLeave={() => setHoveredFulcrum(null)}
                                    onContextMenu={(fulcrum, e) => onFulcrumContextMenu && onFulcrumContextMenu(fulcrum, e)}
                                    onDragStart={handleFulcrumDragStart}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default SvgCanvas;