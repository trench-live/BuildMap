import { useState, useCallback } from 'react';

export const useConnectionForm = (initialData = null) => {
    const [formData, setFormData] = useState({
        distanceMeters: 1.0,
        difficultyFactor: 1.0,
        bidirectional: true,
        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback(() => {
        const newErrors = {};

        const distanceMeters = parseFloat(formData.distanceMeters);
        if (isNaN(distanceMeters) || distanceMeters <= 0) {
            newErrors.distanceMeters = 'Distance must be a positive number';
        } else if (distanceMeters > 10000) {
            newErrors.distanceMeters = 'Distance must not exceed 10000 m';
        }

        const difficultyFactor = parseFloat(formData.difficultyFactor);
        if (isNaN(difficultyFactor) || difficultyFactor < 1) {
            newErrors.difficultyFactor = 'Difficulty factor must be >= 1';
        } else if (difficultyFactor > 100) {
            newErrors.difficultyFactor = 'Difficulty factor must not exceed 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    const resetForm = useCallback((newData = null) => {
        setFormData({
            distanceMeters: 1.0,
            difficultyFactor: 1.0,
            bidirectional: true,
            ...newData
        });
        setErrors({});
        setIsSubmitting(false);
    }, []);

    const getSubmitData = useCallback(() => {
        return {
            distanceMeters: parseFloat(formData.distanceMeters),
            difficultyFactor: parseFloat(formData.difficultyFactor),
            bidirectional: Boolean(formData.bidirectional)
        };
    }, [formData]);

    return {
        formData,
        errors,
        isSubmitting,
        setIsSubmitting,
        updateField,
        validateForm,
        resetForm,
        getSubmitData
    };
};
