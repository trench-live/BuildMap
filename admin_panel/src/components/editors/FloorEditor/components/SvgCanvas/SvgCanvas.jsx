import React, { useRef, useEffect } from 'react';
import { useSvgCanvas } from '../../hooks/useSvgCanvas';
import CanvasBackground from '../CanvasBackground/CanvasBackground';
import SvgContent from '../SvgContent/SvgContent';
import './SvgCanvas.css';

const SvgCanvas = ({ editorState, setEditorState }) => {
    const containerRef = useRef(null);

    const {
        handleMouseDown,
        handleWheel
    } = useSvgCanvas(editorState, setEditorState);

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
            className={`svg-canvas ${editorState.isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
        >
            {!editorState.svgContent ? (
                <CanvasBackground />
            ) : (
                <SvgContent
                    svgContent={editorState.svgContent}
                    offset={editorState.offset}
                    scale={editorState.scale}
                    isDragging={editorState.isDragging}
                />
            )}
        </div>
    );
};

export default SvgCanvas;