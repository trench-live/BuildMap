import { useEffect, useState } from 'react';
import { mappingAreaAPI } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

export const useAreas = (targetUserId = null) => {
    const { user } = useAuth();
    const {
        data: areas,
        loading,
        error,
        execute: loadAreas,
        setData: setAreas
    } = useApi((targetUserId) => {
        if (user?.role === 'ADMIN' && targetUserId) {
            return mappingAreaAPI.getByUser(targetUserId, false);
        }
        if (user?.role === 'ADMIN') {
            return mappingAreaAPI.getAll(false);
        }
        return mappingAreaAPI.getByUser(user.id, false);
    }, false);
    const [areaToDelete, setAreaToDelete] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const reloadAreas = () => loadAreas(targetUserId);

    useEffect(() => {
        if (!user?.id) {
            setAreas([]);
            return;
        }

        reloadAreas().catch(() => {
            // Error state is handled inside useApi.
        });
    }, [user?.id, user?.role, targetUserId]);

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
            reloadAreas();
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
        loadAreas: reloadAreas,
        areaToDelete,
        deleteModalVisible,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel
    };
};
