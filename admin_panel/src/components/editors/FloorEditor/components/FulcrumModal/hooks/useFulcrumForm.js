import { useState, useCallback } from 'react';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';

const DEFAULT_FULCRUM_NAMES = {
    [FULCRUM_TYPES.ROOM]: 'Room',
    [FULCRUM_TYPES.CORRIDOR]: 'Corridor',
    [FULCRUM_TYPES.STAIRS]: 'Stairs',
    [FULCRUM_TYPES.ELEVATOR]: 'Elevator',
    [FULCRUM_TYPES.ENTRANCE]: 'Entrance',
    [FULCRUM_TYPES.HALL]: 'Hall',
    [FULCRUM_TYPES.RESTROOM]: 'Restroom',
    [FULCRUM_TYPES.KITCHEN]: 'Kitchen',
    [FULCRUM_TYPES.RECEPTION]: 'Reception',
    [FULCRUM_TYPES.EMERGENCY_EXIT]: 'Emergency exit',
    [FULCRUM_TYPES.LANDMARK]: 'Landmark'
};

export const getDefaultFulcrumName = (type) => DEFAULT_FULCRUM_NAMES[type] || type || 'Point';

const buildInitialFormData = (data = null) => ({
    name: data?.name || '',
    description: data?.description || '',
    type: data?.type || FULCRUM_TYPES.ROOM,
    facingDirection: data?.facingDirection || FACING_DIRECTIONS.UP,
    hasQr: Boolean(data?.hasQr),
    x: data?.x ?? 0,
    y: data?.y ?? 0,
    floorId: data?.floorId ?? null
});

export const useFulcrumForm = (initialData = null) => {
    const [formData, setFormData] = useState(buildInitialFormData(initialData));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback(() => {
        const nextErrors = {};

        if (formData.name.length > 50) {
            nextErrors.name = 'Name must be at most 50 characters';
        }

        if (formData.description && formData.description.length > 200) {
            nextErrors.description = 'Description must be at most 200 characters';
        }

        if (!Object.values(FULCRUM_TYPES).includes(formData.type)) {
            nextErrors.type = 'Invalid point type';
        }

        if (formData.hasQr && !Object.values(FACING_DIRECTIONS).includes(formData.facingDirection)) {
            nextErrors.facingDirection = 'Invalid direction';
        }

        if (formData.x === undefined || formData.x === null) {
            nextErrors.x = 'X is required';
        }

        if (formData.y === undefined || formData.y === null) {
            nextErrors.y = 'Y is required';
        }

        if (!formData.floorId) {
            nextErrors.floorId = 'Floor id is required';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }, [formData]);

    const updateField = useCallback((field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    const setCoordinates = useCallback((x, y) => {
        setFormData((prev) => ({
            ...prev,
            x,
            y
        }));
    }, []);

    const setFloorId = useCallback((floorId) => {
        setFormData((prev) => ({
            ...prev,
            floorId
        }));
    }, []);

    const resetForm = useCallback((newData = null) => {
        setFormData(buildInitialFormData(newData));
        setErrors({});
        setIsSubmitting(false);
    }, []);

    const getSubmitData = useCallback(() => {
        return {
            name: formData.name.trim() || getDefaultFulcrumName(formData.type),
            description: formData.description.trim(),
            type: formData.type,
            facingDirection: formData.hasQr ? formData.facingDirection : null,
            hasQr: formData.hasQr,
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
