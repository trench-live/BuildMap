import { useState, useCallback } from 'react';

export const useConnectionForm = (initialData = null) => {
    const [formData, setFormData] = useState({
        weight: 1.0,
        bidirectional: true,
        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Валидация формы
    const validateForm = useCallback(() => {
        const newErrors = {};

        const weight = parseFloat(formData.weight);
        if (isNaN(weight) || weight <= 0) {
            newErrors.weight = 'Вес должен быть положительным числом';
        } else if (weight > 100) {
            newErrors.weight = 'Вес не должен превышать 100';
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

    // Сброс формы
    const resetForm = useCallback((newData = null) => {
        setFormData({
            weight: 1.0,
            bidirectional: true,
            ...newData
        });
        setErrors({});
        setIsSubmitting(false);
    }, []);

    // Подготовка данных для отправки
    const getSubmitData = useCallback(() => {
        return {
            weight: parseFloat(formData.weight),
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
