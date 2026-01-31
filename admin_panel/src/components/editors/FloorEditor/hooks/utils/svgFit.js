const parseSvgDimensions = (svgContent) => {
    if (!svgContent) return null;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgContent;
    const svgElement = tempDiv.querySelector('svg');
    if (!svgElement) {
        tempDiv.remove();
        return null;
    }

    const viewBox = svgElement.getAttribute('viewBox');
    let svgWidth;
    let svgHeight;

    if (viewBox) {
        const [, , width, height] = viewBox.split(' ').map(Number);
        svgWidth = width;
        svgHeight = height;
    } else {
        svgWidth = svgElement.width.baseVal.value || 800;
        svgHeight = svgElement.height.baseVal.value || 600;
    }

    tempDiv.remove();
    return { svgWidth, svgHeight };
};

const calculateSvgFit = (svgContent, containerWidth, containerHeight) => {
    if (!svgContent || !containerWidth || !containerHeight) return null;
    const dimensions = parseSvgDimensions(svgContent);
    if (!dimensions) return null;

    const { svgWidth, svgHeight } = dimensions;
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    const scale = Math.max(1, Math.min(scaleX, scaleY));
    const offsetX = Math.max(0, (containerWidth - svgWidth * scale) / 2);
    const offsetY = Math.max(0, (containerHeight - svgHeight * scale) / 2);

    return {
        svgWidth,
        svgHeight,
        scale,
        offsetX,
        offsetY
    };
};

export { calculateSvgFit };
