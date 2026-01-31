/**
 * Расчет масштаба при zoom
 */
export const calculateZoom = (currentScale, deltaY, sensitivity = 0.001) => {
    const zoomFactor = 1 - deltaY * sensitivity;
    return Math.max(0.1, Math.min(5, currentScale * zoomFactor));
};

/**
 * Расчет смещения при перетаскивании
 */
export const calculateOffset = (currentOffset, deltaX, deltaY) => {
    return {
        x: currentOffset.x + deltaX,
        y: currentOffset.y + deltaY
    };
};

/**
 * Расчет смещения при zoom к точке
 */
export const calculateZoomToPoint = (currentScale, newScale, mouseX, mouseY, currentOffset) => {
    const scaleChange = newScale / currentScale;

    return {
        x: mouseX - (mouseX - currentOffset.x) * scaleChange,
        y: mouseY - (mouseY - currentOffset.y) * scaleChange
    };
};

/**
 * Ограничение масштаба
 */
export const clampScale = (scale, min = 0.1, max = 5) => {
    return Math.max(min, Math.min(max, scale));
};

/**
 * Сброс трансформации к начальным значениям
 */
export const resetTransform = () => {
    return {
        scale: 1,
        offset: { x: 0, y: 0 }
    };
};

/**
 * Центрирование SVG в контейнере
 */
export const centerSvgInContainer = (containerWidth, containerHeight, svgWidth, svgHeight) => {
    const scale = Math.min(
        containerWidth / svgWidth * 0.8,
        containerHeight / svgHeight * 0.8,
        1
    );

    const offset = {
        x: (containerWidth - svgWidth * scale) / 2,
        y: (containerHeight - svgHeight * scale) / 2
    };

    return { scale, offset };
};