// Утилиты для расчетов координат fulcrums

// Конвертация координат мыши в координаты относительно SVG
export const getRelativeCoordinates = (event, container, offset, scale) => {
    const rect = container.getBoundingClientRect();

    // Координаты мыши относительно контейнера
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Учитываем трансформации (offset и scale)
    const relativeX = (mouseX - offset.x) / scale;
    const relativeY = (mouseY - offset.y) / scale;

    return { x: relativeX, y: relativeY };
};

// Проверка, находится ли точка внутри контейнера
export const isPointInContainer = (point, container) => {
    const rect = container.getBoundingClientRect();
    return point.x >= 0 && point.x <= rect.width && point.y >= 0 && point.y <= rect.height;
};

// Расчет позиции для отображения fulcrum с учетом трансформаций
export const getFulcrumDisplayPosition = (fulcrum, offset, scale) => {
    return {
        x: fulcrum.x * scale + offset.x,
        y: fulcrum.y * scale + offset.y
    };
};

// Расчет расстояния между двумя точками
export const calculateDistance = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};