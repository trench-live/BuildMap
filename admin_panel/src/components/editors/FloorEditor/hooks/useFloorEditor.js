import { useState, useEffect, useCallback } from 'react';
import { floorAPI } from '../../../../services/api';

export const useFloorEditor = (floor, onSave, onClose) => {
    const [editorState, setEditorState] = useState({
        svgContent: '',
        backgroundImage: null,
        scale: 1,
        offset: { x: 0, y: 0 },
        isDragging: false,
        lastMousePos: { x: 0, y: 0 }
    });

    const [isSaving, setIsSaving] = useState(false);

    // Инициализация состояния при изменении floor
    useEffect(() => {
        if (floor) {
            setEditorState(prev => ({
                ...prev,
                svgContent: floor.svgPlan || '',
                backgroundImage: null,
                scale: 1,
                offset: { x: 0, y: 0 }
            }));
        }
    }, [floor]);

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

            await floorAPI.update(floor.id, updateData);

            // Получаем обновленные данные
            const updatedFloor = await floorAPI.getById(floor.id);
            onSave?.(updatedFloor.data);
            onClose();
        } catch (error) {
            alert('Ошибка сохранения: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    }, [editorState.svgContent, floor, onSave, onClose]);

    // Масштабирование
    const handleZoom = useCallback((zoomFactor) => {
        setEditorState(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(5, prev.scale * zoomFactor))
        }));
    }, []);

    // Сброс вида
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

    return {
        editorState,
        setEditorState,
        isSaving,
        handleSave,
        handleZoom,
        handleResetView,
        handleClearCanvas
    };
};