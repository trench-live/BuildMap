// Utility helpers for fulcrum coordinate math

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Calculates coordinates relative to the image rectangle inside the canvas.
// Returns normalized values (0..1) and image/canvas coordinates in wrapper space.
export const getRelativeCoordinates = (event, container, imageRect, offset, scale) => {
    const rect = container.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const width = imageRect?.width || 1;
    const height = imageRect?.height || 1;
    const offsetX = imageRect?.offsetX || 0;
    const offsetY = imageRect?.offsetY || 0;

    const scaleValue = scale || 1;
    const offsetValue = offset || { x: 0, y: 0 };
    const wrapperX = (mouseX - offsetValue.x) / scaleValue;
    const wrapperY = (mouseY - offsetValue.y) / scaleValue;

    const relativeX = wrapperX - offsetX;
    const relativeY = wrapperY - offsetY;

    const normX = relativeX / width;
    const normY = relativeY / height;

    const clampedX = clamp01(normX);
    const clampedY = clamp01(normY);

    return {
        x: clampedX,
        y: clampedY,
        svgX: clampedX * width,
        svgY: clampedY * height,
        canvasX: offsetX + clampedX * width,
        canvasY: offsetY + clampedY * height
    };
};

// Converts stored normalized coordinates into canvas-space coordinates for rendering.
export const getFulcrumDisplayPosition = (fulcrum, imageRect) => {
    const width = imageRect?.width || 1;
    const height = imageRect?.height || 1;
    const offsetX = imageRect?.offsetX || 0;
    const offsetY = imageRect?.offsetY || 0;

    return {
        x: offsetX + clamp01(fulcrum.x) * width,
        y: offsetY + clamp01(fulcrum.y) * height
    };
};

export const calculateDistance = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};
