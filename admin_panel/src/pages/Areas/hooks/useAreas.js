import { useState } from 'react';
import { mappingAreaAPI } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';

export const useAreas = () => {
    const { data: areas, loading, error, execute: loadAreas } = useApi(() => mappingAreaAPI.getAll(false));
    const [areaToDelete, setAreaToDelete] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleDeleteClick = (area) => {
        setAreaToDelete(area);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!areaToDelete) return;

        try {
            await mappingAreaAPI.delete(areaToDelete.id);
            alert('Зона удалена!');
            setDeleteModalVisible(false);
            setAreaToDelete(null);
            loadAreas();
        } catch (error) {
            alert('Ошибка удаления: ' + (error.response?.data?.message || error.message));
            setDeleteModalVisible(false);
            setAreaToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setAreaToDelete(null);
    };

    return {
        areas,
        loading,
        error,
        loadAreas,
        areaToDelete,
        deleteModalVisible,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel
    };
};