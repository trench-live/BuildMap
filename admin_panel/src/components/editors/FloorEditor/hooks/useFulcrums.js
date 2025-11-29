import { useState, useEffect, useCallback } from 'react';
import { fulcrumAPI } from '../../../../services/api';
import { useFulcrumActions } from './useFulcrumActions';

export const useFulcrums = (floorId) => {
    const [fulcrums, setFulcrums] = useState([]);
    const [connections, setConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Обработчики успешных операций
    const handleSuccess = useCallback((action, data) => {
        console.log(`✅ ${action}:`, data);
    }, []);

    // Обработчики ошибок
    const handleError = useCallback((action, error) => {
        console.error(`❌ ${action}:`, error);
        setError(error.response?.data?.message || `Ошибка при выполнении ${action}`);
    }, []);

    const {
        createFulcrum: createFulcrumAction,
        updateFulcrum: updateFulcrumAction,
        deleteFulcrum: deleteFulcrumAction,
        addConnection: addConnectionAction,
        removeConnection: removeConnectionAction
    } = useFulcrumActions(floorId, handleSuccess, handleError);

    // Загрузка fulcrums для этажа
    const loadFulcrums = useCallback(async () => {
        if (!floorId) return;

        setIsLoading(true);
        setError(null);
        try {
            console.log('📥 Loading fulcrums for floor:', floorId);
            const response = await fulcrumAPI.getByFloor(floorId);
            const fulcrumsData = response.data;

            console.log('📋 Raw fulcrums from API:', fulcrumsData);

            // Фильтруем удаленные точки (deleted: true)
            const activeFulcrums = fulcrumsData.filter(fulcrum => !fulcrum.deleted);

            console.log('✅ Active fulcrums after filter:', activeFulcrums);

            setFulcrums(activeFulcrums);

            // Извлекаем connections из fulcrums
            const allConnections = [];
            activeFulcrums.forEach(fulcrum => {
                if (fulcrum.connections) {
                    fulcrum.connections.forEach(connection => {
                        allConnections.push({
                            from: fulcrum.id,
                            to: connection.connectedFulcrumId,
                            weight: connection.weight
                        });
                    });
                }
            });
            setConnections(allConnections);

        } catch (err) {
            handleError('load_fulcrums_error', err);
        } finally {
            setIsLoading(false);
        }
    }, [floorId, handleError]);

    // Обертки действий с обновлением локального состояния
    const createFulcrum = useCallback(async (fulcrumData) => {
        const newFulcrum = await createFulcrumAction(fulcrumData);
        setFulcrums(prev => [...prev, newFulcrum]);
        return newFulcrum;
    }, [createFulcrumAction]);

    const updateFulcrum = useCallback(async (fulcrumId, updateData) => {
        const updatedFulcrum = await updateFulcrumAction(fulcrumId, updateData);
        setFulcrums(prev => prev.map(f =>
            f.id === fulcrumId ? updatedFulcrum : f
        ));
        return updatedFulcrum;
    }, [updateFulcrumAction]);

    const deleteFulcrum = useCallback(async (fulcrumId) => {
        await deleteFulcrumAction(fulcrumId);
        setFulcrums(prev => prev.filter(f => f.id !== fulcrumId));
        // Также удаляем связанные connections
        setConnections(prev => prev.filter(conn =>
            conn.from !== fulcrumId && conn.to !== fulcrumId
        ));
    }, [deleteFulcrumAction]);

    const addConnection = useCallback(async (fromFulcrumId, connectionData) => {
        await addConnectionAction(fromFulcrumId, connectionData);
        setConnections(prev => [...prev, {
            from: fromFulcrumId,
            to: connectionData.connectedFulcrumId,
            weight: connectionData.weight
        }]);
    }, [addConnectionAction]);

    const removeConnection = useCallback(async (fromFulcrumId, toFulcrumId) => {
        await removeConnectionAction(fromFulcrumId, toFulcrumId);
        setConnections(prev => prev.filter(conn =>
            !(conn.from === fromFulcrumId && conn.to === toFulcrumId)
        ));
    }, [removeConnectionAction]);

    // Загружаем fulcrums при изменении floorId
    useEffect(() => {
        if (floorId) {
            loadFulcrums();
        }
    }, [floorId, loadFulcrums]);

    return {
        fulcrums,
        connections,
        isLoading,
        error,
        createFulcrum,
        updateFulcrum,
        deleteFulcrum,
        addConnection,
        removeConnection,
        reloadFulcrums: loadFulcrums
    };
};