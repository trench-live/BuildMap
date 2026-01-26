import { useCallback, useEffect, useState } from 'react';

const useCanvasSize = ({ containerRef, svgContent, updateContainerSize }) => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const updateSize = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (width > 0 && height > 0) {
            updateContainerSize?.(width, height);
            setCanvasSize({ width, height });
        }
    }, [containerRef, updateContainerSize]);

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
    }, [updateSize, containerRef]);

    useEffect(() => {
        if (!svgContent) return;
        const timer = setTimeout(updateSize, 100);
        return () => clearTimeout(timer);
    }, [svgContent, updateSize]);

    return { canvasSize, updateSize };
};

export default useCanvasSize;
