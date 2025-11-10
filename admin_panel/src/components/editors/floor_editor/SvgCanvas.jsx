import React, { useCallback, useRef, useEffect } from 'react';

const SvgCanvas = ({ editorState, setEditorState }) => {
    const containerRef = useRef(null);

    // Обработка начала перетаскивания
    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return;

        setEditorState(prev => ({
            ...prev,
            isDragging: true,
            lastMousePos: { x: e.clientX, y: e.clientY }
        }));

        e.preventDefault();
    }, [setEditorState]);

    // Обработка перемещения мыши
    const handleMouseMove = useCallback((e) => {
        if (!editorState.isDragging) return;

        const deltaX = e.clientX - editorState.lastMousePos.x;
        const deltaY = e.clientY - editorState.lastMousePos.y;

        setEditorState(prev => ({
            ...prev,
            offset: {
                x: prev.offset.x + deltaX,
                y: prev.offset.y + deltaY
            },
            lastMousePos: { x: e.clientX, y: e.clientY }
        }));

        e.preventDefault();
    }, [editorState.isDragging, editorState.lastMousePos, setEditorState]);

    // Обработка окончания перетаскивания
    const handleMouseUp = useCallback(() => {
        setEditorState(prev => ({ ...prev, isDragging: false }));
    }, [setEditorState]);

    // Упрощенное масштабирование относительно курсора
    const handleWheel = useCallback((e) => {
        e.preventDefault();

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = containerRef.current.getBoundingClientRect();

        // Позиция курсора относительно контейнера
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newScale = Math.max(0.1, Math.min(5, editorState.scale * zoomFactor));
        const scaleChange = newScale / editorState.scale;

        // Простое вычисление нового смещения
        const newOffsetX = mouseX - (mouseX - editorState.offset.x) * scaleChange;
        const newOffsetY = mouseY - (mouseY - editorState.offset.y) * scaleChange;

        setEditorState(prev => ({
            ...prev,
            scale: newScale,
            offset: {
                x: newOffsetX,
                y: newOffsetY
            }
        }));
    }, [editorState.scale, editorState.offset, setEditorState]);

    // Добавляем глобальные обработчики событий
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setEditorState(prev => ({ ...prev, isDragging: false }));
        };

        const handleGlobalMouseMove = (e) => {
            if (editorState.isDragging) {
                handleMouseMove(e);
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
        document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [editorState.isDragging, handleMouseMove, setEditorState]);

    // Добавляем обработчик wheel
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelWithOptions = (e) => {
            handleWheel(e);
        };

        container.addEventListener('wheel', handleWheelWithOptions, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheelWithOptions);
        };
    }, [handleWheel]);

    return (
        <div
            ref={containerRef}
            className={`canvas-container ${editorState.isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
        >
            {!editorState.svgContent ? (
                <div className="canvas-background">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
                        <p>Загрузите изображение плана этажа</p>
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                            Поддерживаются форматы: JPG, PNG, SVG
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: `translate(${editorState.offset.x}px, ${editorState.offset.y}px) scale(${editorState.scale})`,
                        transformOrigin: '0 0',
                        cursor: editorState.isDragging ? 'grabbing' : 'grab'
                    }}
                    dangerouslySetInnerHTML={{ __html: editorState.svgContent }}
                />
            )}
        </div>
    );
};

export default SvgCanvas;