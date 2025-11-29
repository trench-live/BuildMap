import { useState, useEffect, useCallback } from 'react';
import { floorAPI } from '../../../../services/api';
import { EDITOR_MODES } from '../types/editorTypes';

export const useFloorEditor = (floor, onSave, onClose) => {
    const [editorState, setEditorState] = useState({
        svgContent: '',
        backgroundImage: null,
        scale: 1,
        offset: { x: 0, y: 0 },
        isDragging: false,
        lastMousePos: { x: 0, y: 0 },
        mode: EDITOR_MODES.VIEW,
        selectedFulcrum: null,
        selectedConnection: null,
        dragStartFulcrum: null
    });

    const [isSaving, setIsSaving] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Функция для центрирования и подбора масштаба
    // Функция для центрирования и подбора масштаба
    const centerAndFitImage = useCallback((svgContent, containerWidth, containerHeight) => {
        if (!svgContent || !containerWidth || !containerHeight) return;

        // Создаем временный элемент для получения размеров SVG
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        const svgElement = tempDiv.querySelector('svg');

        if (!svgElement) return;

        // Получаем размеры SVG
        const viewBox = svgElement.getAttribute('viewBox');
        let svgWidth, svgHeight;

        if (viewBox) {
            const [, , width, height] = viewBox.split(' ').map(Number);
            svgWidth = width;
            svgHeight = height;
        } else {
            svgWidth = svgElement.width.baseVal.value || 800;
            svgHeight = svgElement.height.baseVal.value || 600;
        }

        // Рассчитываем масштаб, чтобы вместить SVG в контейнер
        const scaleX = containerWidth / svgWidth;
        const scaleY = containerHeight / svgHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% от максимального размера для отступов

        // Рассчитываем смещение для центрирования
        const offsetX = (containerWidth - svgWidth * scale) / 2;
        const offsetY = (containerHeight - svgHeight * scale) / 2;

        setEditorState(prev => ({
            ...prev,
            scale: scale,
            offset: { x: offsetX, y: offsetY }
        }));

        // Очищаем временный элемент
        tempDiv.remove();
    }, []);

    // Инициализация состояния при изменении floor
    useEffect(() => {
        if (floor) {
            setEditorState(prev => ({
                ...prev,
                svgContent: floor.svgPlan || '',
                backgroundImage: null,
                scale: 1,
                offset: { x: 0, y: 0 },
                mode: EDITOR_MODES.VIEW,
                selectedFulcrum: null,
                selectedConnection: null,
                dragStartFulcrum: null
            }));

            // Если есть SVG контент, центрируем его после загрузки
            if (floor.svgPlan && containerSize.width > 0 && containerSize.height > 0) {
                setTimeout(() => {
                    centerAndFitImage(floor.svgPlan, containerSize.width, containerSize.height);
                }, 100);
            }
        }
    }, [floor, containerSize, centerAndFitImage]);

    // Функция для обновления размеров контейнера
    const updateContainerSize = useCallback((width, height) => {
        setContainerSize({ width, height });

        // Если есть SVG контент, пересчитываем центрирование
        if (editorState.svgContent && width > 0 && height > 0) {
            centerAndFitImage(editorState.svgContent, width, height);
        }
    }, [editorState.svgContent, centerAndFitImage]);

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

    // Сброс вида к центрированному
    const handleResetView = useCallback(() => {
        if (editorState.svgContent && containerSize.width > 0 && containerSize.height > 0) {
            centerAndFitImage(editorState.svgContent, containerSize.width, containerSize.height);
        } else {
            setEditorState(prev => ({
                ...prev,
                scale: 1,
                offset: { x: 0, y: 0 }
            }));
        }
    }, [editorState.svgContent, containerSize, centerAndFitImage]);

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

    // Установка режима редактора
    const setMode = useCallback((mode, data = null) => {
        setEditorState(prev => ({
            ...prev,
            mode,
            ...(data && { selectedFulcrum: data }),
            ...(mode === EDITOR_MODES.VIEW && {
                selectedFulcrum: null,
                selectedConnection: null,
                dragStartFulcrum: null
            })
        }));
    }, []);

    // Начало перетаскивания для создания связи
    const startConnectionDrag = useCallback((fulcrum) => {
        setEditorState(prev => ({
            ...prev,
            mode: EDITOR_MODES.CREATE_CONNECTION,
            dragStartFulcrum: fulcrum
        }));
    }, []);

    // Завершение перетаскивания связи
    const endConnectionDrag = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            mode: EDITOR_MODES.VIEW,
            dragStartFulcrum: null
        }));
    }, []);

    return {
        editorState,
        setEditorState,
        isSaving,
        handleSave,
        handleZoom,
        handleResetView,
        handleClearCanvas,
        setMode,
        startConnectionDrag,
        endConnectionDrag,
        updateContainerSize,
        containerSize
    };
};