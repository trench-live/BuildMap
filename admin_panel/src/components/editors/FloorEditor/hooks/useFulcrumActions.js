import { useCallback } from 'react';
import { fulcrumAPI } from '../../../../services/api';

export const useFulcrumActions = (floorId, onSuccess, onError) => {
    // Создание fulcrum
    const createFulcrum = useCallback(async (fulcrumData) => {
        try {
            const response = await fulcrumAPI.create({
                ...fulcrumData,
                floorId: floorId
            });
            onSuccess?.('fulcrum_created', response.data);
            return response.data;
        } catch (error) {
            onError?.('fulcrum_create_error', error);
            throw error;
        }
    }, [floorId, onSuccess, onError]);

    // Обновление fulcrum
    const updateFulcrum = useCallback(async (fulcrumId, updateData) => {
        try {
            const response = await fulcrumAPI.update(fulcrumId, updateData);
            onSuccess?.('fulcrum_updated', response.data);
            return response.data;
        } catch (error) {
            onError?.('fulcrum_update_error', error);
            throw error;
        }
    }, [onSuccess, onError]);

    // Удаление fulcrum
    const deleteFulcrum = useCallback(async (fulcrumId) => {
        try {
            await fulcrumAPI.delete(fulcrumId);
            onSuccess?.('fulcrum_deleted', { id: fulcrumId });
        } catch (error) {
            onError?.('fulcrum_delete_error', error);
            throw error;
        }
    }, [onSuccess, onError]);

    // Добавление связи
    const addConnection = useCallback(async (fromFulcrumId, connectionData) => {
        try {
            await fulcrumAPI.addConnection(fromFulcrumId, connectionData);
            onSuccess?.('connection_created', {
                from: fromFulcrumId,
                to: connectionData.connectedFulcrumId,
                weight: connectionData.weight
            });
        } catch (error) {
            onError?.('connection_create_error', error);
            throw error;
        }
    }, [onSuccess, onError]);

    // Удаление связи
    const removeConnection = useCallback(async (fromFulcrumId, toFulcrumId) => {
        try {
            await fulcrumAPI.removeConnection(fromFulcrumId, toFulcrumId);
            onSuccess?.('connection_deleted', {
                from: fromFulcrumId,
                to: toFulcrumId
            });
        } catch (error) {
            onError?.('connection_delete_error', error);
            throw error;
        }
    }, [onSuccess, onError]);

    return {
        createFulcrum,
        updateFulcrum,
        deleteFulcrum,
        addConnection,
        removeConnection
    };
};