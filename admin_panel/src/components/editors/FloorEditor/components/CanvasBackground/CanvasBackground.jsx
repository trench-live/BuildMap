import React from 'react';
import './CanvasBackground.css';

const CanvasBackground = () => {
    return (
        <div className="canvas-background">
            <div className="background-content">
                <div className="background-icon">🏗️</div>
                <h3>Загрузите изображение плана этажа</h3>
                <p className="background-subtitle">
                    Поддерживаются форматы: JPG, PNG, SVG, GIF
                </p>
                <p className="background-hint">
                    Используйте кнопку "Загрузить изображение" в панели инструментов
                </p>
            </div>
        </div>
    );
};

export default CanvasBackground;