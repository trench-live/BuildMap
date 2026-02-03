import { useState, useEffect, useCallback } from 'react';

const getErrorMessage = (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return 'Сервер недоступен. Проверьте подключение.';
    }

    if (error.response?.status === 404) {
        return 'Ресурс не найден';
    }

    if (error.response?.status >= 500) {
        return 'Ошибка сервера';
    }

    return error.response?.data?.message || error.message || 'Произошла ошибка';
};

export const useApi = (apiFunction, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return {
        data,
        loading,
        error,
        execute,
        setData
    };
};
