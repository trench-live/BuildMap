import React from 'react';
import './SvgContent.css';

const SvgContent = ({ svgContent, isDragging }) => {
    return (
        <div
            className="svg-content"
            style={{
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

export default SvgContent;