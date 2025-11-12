/**
 * Создает SVG из данных изображения
 */
export const createSvgFromImage = (imageData, width, height) => {
    return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <image href="${imageData}" width="${width}" height="${height}" />
        </svg>
    `.trim();
};

/**
 * Проверяет валидность SVG контента
 */
export const isValidSvg = (svgContent) => {
    if (!svgContent || typeof svgContent !== 'string') return false;
    const trimmed = svgContent.trim();
    return trimmed.startsWith('<svg') && trimmed.endsWith('</svg>');
};

/**
 * Получает размеры SVG
 */
export const getSvgDimensions = (svgContent) => {
    if (!isValidSvg(svgContent)) return { width: 0, height: 0 };

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svg = doc.querySelector('svg');

        if (!svg) return { width: 0, height: 0 };

        const width = parseInt(svg.getAttribute('width')) ||
            parseInt(svg.getAttribute('viewBox')?.split(' ')[2]) || 0;
        const height = parseInt(svg.getAttribute('height')) ||
            parseInt(svg.getAttribute('viewBox')?.split(' ')[3]) || 0;

        return { width, height };
    } catch (error) {
        console.error('Error parsing SVG:', error);
        return { width: 0, height: 0 };
    }
};

/**
 * Извлекает изображение из SVG
 */
export const extractImageFromSvg = (svgContent) => {
    if (!isValidSvg(svgContent)) return null;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const image = doc.querySelector('image');

        return image ? image.getAttribute('href') : null;
    } catch (error) {
        console.error('Error extracting image from SVG:', error);
        return null;
    }
};