import { useState, useEffect, useCallback } from 'react';
import { floorAPI } from '../../../../services/api';
import { EDITOR_MODES } from '../types/editorTypes';

import {
    GRID_STEP_DEFAULT,
    clampGridStep,
    normalizeGridOffset,
    loadGridOffset,
    saveGridOffset
} from './utils/gridSettings';
import { calculateSvgFit } from './utils/svgFit';

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
        gridEnabled: false,
        gridStep: GRID_STEP_DEFAULT,
        gridOffset: { x: 0, y: 0 }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

    // Центруем и подгоняем изображение под контейнер
    const centerAndFitImage = useCallback((svgContent, containerWidth, containerHeight) => {
        const fit = calculateSvgFit(svgContent, containerWidth, containerHeight);
        if (!fit) return;

        setSvgSize({ width: fit.svgWidth, height: fit.svgHeight });

        setEditorState(prev => ({
            ...prev,
            scale: fit.scale,
            offset: { x: fit.offsetX, y: fit.offsetY }
        }));
    }, []);

    // Загружаем данные этажа при смене floor
    useEffect(() => {
        if (!floor) return;

        const savedGridOffset = loadGridOffset(floor.id);

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
            gridEnabled: prev.gridEnabled ?? false,
            gridStep: clampGridStep(prev.gridStep ?? GRID_STEP_DEFAULT),
            gridOffset: savedGridOffset ?? normalizeGridOffset(prev.gridOffset)
        }));
    }, [floor]);

    useEffect(() => {
        if (!floor?.id) return;
        saveGridOffset(floor.id, editorState.gridOffset);
    }, [floor?.id, editorState.gridOffset]);

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
