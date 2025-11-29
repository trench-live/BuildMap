import { useCallback, useEffect } from 'react';
import { calculateZoom, calculateOffset, calculateZoomToPoint } from '../utils';

export const useSvgCanvas = (editorState, setEditorState) => {
    // Обработка начала перетаскивания
    const handleMouseDown = useCallback((e) => {
        // Если создаем связь, не перетаскиваем канвас
        if (editorState.mode === 'create_connection') {
            return;
        }

        if (e.button !== 0) return;

        setEditorState(prev => ({
            ...prev,
            isDragging: true,
            lastMousePos: { x: e.clientX, y: e.clientY }
        }));

        e.preventDefault();
    }, [setEditorState, editorState.mode]);

    // Обработка перемещения мыши
    const handleMouseMove = useCallback((e) => {
        if (!editorState.isDragging) return;

        const deltaX = e.clientX - editorState.lastMousePos.x;
        const deltaY = e.clientY - editorState.lastMousePos.y;

        const newOffset = calculateOffset(editorState.offset, deltaX, deltaY);

        setEditorState(prev => ({
            ...prev,
            offset: newOffset,
            lastMousePos: { x: e.clientX, y: e.clientY }
        }));

        e.preventDefault();
    }, [editorState.isDragging, editorState.lastMousePos, editorState.offset, setEditorState]);

    // Обработка окончания перетаскивания
    const handleMouseUp = useCallback(() => {
        setEditorState(prev => ({ ...prev, isDragging: false }));
    }, [setEditorState]);

    // Обработка масштабирования колесиком мыши
    const handleWheel = useCallback((e) => {
        e.preventDefault();

        const newScale = calculateZoom(editorState.scale, e.deltaY);
        const rect = e.currentTarget.getBoundingClientRect();

        // Позиция курсора относительно контейнера
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newOffset = calculateZoomToPoint(
            editorState.scale,
            newScale,
            mouseX,
            mouseY,
            editorState.offset
        );

        setEditorState(prev => ({
            ...prev,
            scale: newScale,
            offset: newOffset
        }));
    }, [editorState.scale, editorState.offset, setEditorState]);

    // Глобальные обработчики событий
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setEditorState(prev => ({ ...prev, isDragging: false }));
        };

        const handleGlobalMouseMove = (e) => {
            if (editorState.isDragging) {
                handleMouseMove(e);
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [editorState.isDragging, handleMouseMove]);

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel
    };
};