import React, { useState, useCallback, useEffect } from 'react';
import { floorAPI } from '../../../services/api';
import SvgCanvas from './SvgCanvas';
import Toolbar from './ToolBar';
import './FloorEditor.css';

const FloorEditor = ({ floor, visible, onClose, onSave }) => {
    const [editorState, setEditorState] = useState({
        svgContent: '',
        backgroundImage: null,
        scale: 1,
        offset: { x: 0, y: 0 },
        isDragging: false,
        lastMousePos: { x: 0, y: 0 }
    });

    const [isSaving, setIsSaving] = useState(false);

    // 🔥 ИСПРАВЛЕНИЕ: Обновляем состояние когда меняется floor или visible
    useEffect(() => {
        if (visible && floor) {
            console.log('Updating editor state with floor svgPlan:', {
                hasSvgPlan: !!floor.svgPlan,
                svgPlanLength: floor.svgPlan?.length
            });

            setEditorState(prev => ({
                ...prev,
                svgContent: floor.svgPlan || '',
                backgroundImage: null,
                scale: 1,
                offset: { x: 0, y: 0 }
            }));
        }
    }, [visible, floor]); // Зависимость от visible и floor

    // Загрузка фонового изображения
    const handleImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const svg = `
          <svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg">
            <image href="${e.target.result}" width="${img.width}" height="${img.height}" />
          </svg>
        `;

                setEditorState(prev => ({
                    ...prev,
                    svgContent: svg,
                    backgroundImage: e.target.result,
                    scale: 1,
                    offset: { x: 0, y: 0 }
                }));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }, []);

    // Обработка масштабирования
    const handleZoom = useCallback((zoomFactor) => {
        setEditorState(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(5, prev.scale * zoomFactor))
        }));
    }, []);

    // Сброс масштаба и положения
    const handleResetView = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            scale: 1,
            offset: { x: 0, y: 0 }
        }));
    }, []);

    // Очистка холста
    const handleClearCanvas = useCallback(() => {
        if (confirm('Вы уверены, что хотите очистить холст? Все несохраненные изменения будут потеряны.')) {
            setEditorState(prev => ({
                ...prev,
                svgContent: '',
                backgroundImage: null
            }));
        }
    }, []);

    // Сохранение этажа
    const handleSave = useCallback(async () => {
        if (!editorState.svgContent.trim()) {
            alert('Холст пуст. Загрузите изображение или создайте план.');
            return;
        }

        setIsSaving(true);
        try {
            const updateData = {
                name: floor.name,
                level: floor.level,
                description: floor.description,
                svgPlan: editorState.svgContent
            };

            console.log('Saving floor with svgPlan length:', editorState.svgContent.length);

            await floorAPI.update(floor.id, updateData);

            // Принудительно перезагружаем данные этажа
            const updatedFloor = await floorAPI.getById(floor.id);
            console.log('Updated floor data:', updatedFloor.data);

            onSave?.(updatedFloor.data);
            onClose();
        } catch (error) {
            alert('Ошибка сохранения: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    }, [editorState.svgContent, floor, onSave, onClose]);

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal floor-editor-modal">
                <div className="modal-header">
                    <h3>Редактор этажа: {floor?.name}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="floor-editor-content">
                    <Toolbar
                        onImageUpload={handleImageUpload}
                        onZoomIn={() => handleZoom(1.2)}
                        onZoomOut={() => handleZoom(0.8)}
                        onResetView={handleResetView}
                        onClearCanvas={handleClearCanvas}
                        onSave={handleSave}
                        scale={editorState.scale}
                        hasContent={!!editorState.svgContent}
                        isSaving={isSaving}
                    />

                    <SvgCanvas
                        editorState={editorState}
                        setEditorState={setEditorState}
                    />
                </div>
            </div>
        </div>
    );
};

export default FloorEditor;