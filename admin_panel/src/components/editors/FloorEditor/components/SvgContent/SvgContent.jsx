import React from 'react';
import './SvgContent.css';

const SvgContent = ({ svgContent, offset, scale, isDragging }) => {
    return (
        <div
            className="svg-content"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

export default SvgContent;