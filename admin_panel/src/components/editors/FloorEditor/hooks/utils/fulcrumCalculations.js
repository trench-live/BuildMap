// Utility helpers for fulcrum coordinate math

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Calculates coordinates relative to the SVG canvas.
// Returns normalized values (0..1) and raw SVG-space values (before scale/offset), clamped to canvas bounds.
export const getRelativeCoordinates = (event, container, offset, scale, svgSize) => {
    const rect = container.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const relativeX = (mouseX - offset.x) / scale;
    const relativeY = (mouseY - offset.y) / scale;

    const width = svgSize?.width || 1;
    const height = svgSize?.height || 1;

    const normX = relativeX / width;
    const normY = relativeY / height;

    const clampedX = clamp01(normX);
    const clampedY = clamp01(normY);

    return {
        x: clampedX,
        y: clampedY,
        svgX: clampedX * width,
        svgY: clampedY * height
    };
};

// Converts stored normalized coordinates into SVG-space coordinates for rendering.
export const getFulcrumDisplayPosition = (fulcrum, offset, scale, svgSize) => {
    const width = svgSize?.width || 1;
    const height = svgSize?.height || 1;

    return {
        x: clamp01(fulcrum.x) * width,
        y: clamp01(fulcrum.y) * height
    };
};

export const calculateDistance = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};
