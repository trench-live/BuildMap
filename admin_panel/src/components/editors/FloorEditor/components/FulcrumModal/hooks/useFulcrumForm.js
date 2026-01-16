import { useState, useCallback } from 'react';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';

export const useFulcrumForm = (initialData = null) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: FULCRUM_TYPES.ROOM,
        facingDirection: FACING_DIRECTIONS.UP,
        x: 0,
        y: 0,
        floorId: null,
        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Валидация формы
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Название обязательно';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Название не должно превышать 50 символов';
        }

        if (formData.description && formData.description.length > 200) {
            newErrors.description = 'Описание не должно превышать 200 символов';
        }

        if (!Object.values(FULCRUM_TYPES).includes(formData.type)) {
            newErrors.type = 'Неверный тип точки';
        }

        if (!Object.values(FACING_DIRECTIONS).includes(formData.facingDirection)) {
            newErrors.facingDirection = 'Invalid direction.';
        }

        if (formData.x === undefined || formData.x === null) {
            newErrors.x = 'Координата X обязательна';
        }

        if (formData.y === undefined || formData.y === null) {
            newErrors.y = 'Координата Y обязательна';
        }

        if (!formData.floorId) {
            newErrors.floorId = 'ID этажа обязателен';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Обновление поля формы
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    // Установка координат
    const setCoordinates = useCallback((x, y) => {
        setFormData(prev => ({
            ...prev,
            x,
            y
        }));
    }, []);

    // Установка floorId
    const setFloorId = useCallback((floorId) => {
        setFormData(prev => ({
            ...prev,
            floorId
        }));
    }, []);

    // Сброс формы
    const resetForm = useCallback((newData = null) => {
        setFormData({
            name: '',
            description: '',
            type: FULCRUM_TYPES.ROOM,
            facingDirection: FACING_DIRECTIONS.UP,
            x: 0,
            y: 0,
            floorId: null,
            ...newData
        });
        setErrors({});
        setIsSubmitting(false);
    }, []);

    // Подготовка данных для отправки
    const getSubmitData = useCallback(() => {
        return {
            name: formData.name.trim(),
            description: formData.description.trim(),
            type: formData.type,
            facingDirection: formData.facingDirection,
            x: formData.x,
            y: formData.y,
            floorId: formData.floorId
        };
    }, [formData]);

    return {
        formData,
        errors,
        isSubmitting,
        setIsSubmitting,
        updateField,
        setCoordinates,
        setFloorId,
        validateForm,
        resetForm,
        getSubmitData
    };
};
