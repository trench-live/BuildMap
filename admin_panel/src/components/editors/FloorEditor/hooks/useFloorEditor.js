import { useState, useEffect, useCallback } from 'react';
import { floorAPI } from '../../../../services/api';
import { EDITOR_MODES } from '../types/editorTypes';

const GRID_STEP_DEFAULT = 0.04;
const GRID_STEP_MIN = 0.005;
const GRID_STEP_MAX = 0.2;

const clampGridStep = (value) => {
    if (!Number.isFinite(value)) return GRID_STEP_DEFAULT;
    const clamped = Math.max(GRID_STEP_MIN, Math.min(GRID_STEP_MAX, value));
    return Number(clamped.toFixed(6));
};

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
        dragStartFulcrum: null,
        gridEnabled: true,
        gridStep: GRID_STEP_DEFAULT
    });

    const [isSaving, setIsSaving] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

    // Центруем и подгоняем изображение под контейнер
    const centerAndFitImage = useCallback((svgContent, containerWidth, containerHeight) => {
        if (!svgContent || !containerWidth || !containerHeight) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        const svgElement = tempDiv.querySelector('svg');
        if (!svgElement) return;

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

        const scaleX = containerWidth / svgWidth;
        const scaleY = containerHeight / svgHeight;
        // Не уменьшаем масштаб ниже 1.0 при первом открытии
        const scale = Math.max(1, Math.min(scaleX, scaleY));

        // Центруем, но не даём сместиться за границы контейнера
        const offsetX = Math.max(0, (containerWidth - svgWidth * scale) / 2);
        const offsetY = Math.max(0, (containerHeight - svgHeight * scale) / 2);

        setSvgSize({ width: svgWidth, height: svgHeight });

        setEditorState(prev => ({
            ...prev,
            scale,
            offset: { x: offsetX, y: offsetY }
        }));

        tempDiv.remove();
    }, []);

    // Загружаем данные этажа при смене floor
    useEffect(() => {
        if (!floor) return;

        setEditorState(prev => ({
            ...prev,
            svgContent: floor.svgPlan || '',
            backgroundImage: null,
            scale: 1,
            offset: { x: 0, y: 0 },
            mode: EDITOR_MODES.VIEW,
            selectedFulcrum: null,
            selectedConnection: null,
            dragStartFulcrum: null,
            gridEnabled: prev.gridEnabled ?? true,
            gridStep: clampGridStep(prev.gridStep ?? GRID_STEP_DEFAULT)
        }));
    }, [floor]);

    // Подгоняем содержимое, когда есть контент и известен размер контейнера
    useEffect(() => {
        if (!containerSize.width || !containerSize.height) return;
        if (editorState.svgContent) {
            centerAndFitImage(editorState.svgContent, containerSize.width, containerSize.height);
        } else {
            setSvgSize({ width: containerSize.width, height: containerSize.height });
        }
    }, [editorState.svgContent, containerSize.width, containerSize.height, centerAndFitImage]);

    // Обновление размеров контейнера
    const updateContainerSize = useCallback((width, height) => {
        setContainerSize({ width, height });

        if (!editorState.svgContent) {
            setSvgSize({ width, height });
        }
    }, [editorState.svgContent]);

    // Сохранение этажа
    const handleSave = useCallback(async () => {
        if (!editorState.svgContent.trim()) {
            alert('Нет плана. Загрузите изображение или вставьте план.');
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
            const updatedFloor = await floorAPI.getById(floor.id);
            onSave?.(updatedFloor.data);
            onClose();
        } catch (error) {
            alert('Ошибка при сохранении плана: ' + (error.response?.data?.message || error.message));
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

    // Очистка канваса
    const handleClearCanvas = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            svgContent: '',
            backgroundImage: null
        }));
    }, []);

    // Изменение режима
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

    // Начало/конец перетаскивания связи
    const startConnectionDrag = useCallback((fulcrum) => {
        setEditorState(prev => ({
            ...prev,
            mode: EDITOR_MODES.CREATE_CONNECTION,
            dragStartFulcrum: fulcrum
        }));
    }, []);

    const endConnectionDrag = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            mode: EDITOR_MODES.VIEW,
            dragStartFulcrum: null
        }));
    }, []);

    const toggleGrid = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            gridEnabled: !prev.gridEnabled
        }));
    }, []);

    const increaseGridStep = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            gridStep: clampGridStep((prev.gridStep || GRID_STEP_DEFAULT) * 2)
        }));
    }, []);

    const decreaseGridStep = useCallback(() => {
        setEditorState(prev => ({
            ...prev,
            gridStep: clampGridStep((prev.gridStep || GRID_STEP_DEFAULT) / 2)
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
        toggleGrid,
        increaseGridStep,
        decreaseGridStep,
        updateContainerSize,
        containerSize,
        svgSize
    };
};
