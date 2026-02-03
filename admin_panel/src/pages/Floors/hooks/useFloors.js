import { useState, useEffect, useCallback } from 'react';
import { floorAPI, mappingAreaAPI } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

export const useFloors = () => {
    const { user } = useAuth();
    const [expandedArea, setExpandedArea] = useState(null);
    const [floors, setFloors] = useState({});
    const [loadingFloors, setLoadingFloors] = useState({});
    const [floorsCount, setFloorsCount] = useState({});

    const getAreasRequest = useCallback(() => {
        if (user?.role === 'ADMIN') {
            return mappingAreaAPI.getAll(false);
        }
        return mappingAreaAPI.getByUser(user.id, false);
    }, [user?.id, user?.role]);

    const {
        data: areas,
        loading: areasLoading,
        execute: loadAreas,
        setData: setAreas
    } = useApi(getAreasRequest, false);

    const loadFloorsCountForAllAreas = useCallback(async () => {
        if (!areas?.length) {
            setFloorsCount({});
            return;
        }

        const counts = {};
        for (const area of areas) {
            try {
                const response = await floorAPI.getByArea(area.id, false);
                counts[area.id] = response.data.length;
            } catch (error) {
                console.error(`Error loading floors count for area ${area.id}:`, error);
                counts[area.id] = 0;
            }
        }
        setFloorsCount(counts);
    }, [areas]);

    useEffect(() => {
        if (!user?.id) {
            setAreas([]);
            return;
        }

        loadAreas().catch(() => {
            // Error state is handled inside useApi.
        });
    }, [loadAreas, setAreas, user?.id]);

    useEffect(() => {
        loadFloorsCountForAllAreas();
    }, [loadFloorsCountForAllAreas]);

    const loadFloorsForArea = async (areaId) => {
        setLoadingFloors(prev => ({ ...prev, [areaId]: true }));
        try {
            const response = await floorAPI.getByArea(areaId, false);
            setFloors(prev => ({ ...prev, [areaId]: response.data }));
            setFloorsCount(prev => ({ ...prev, [areaId]: response.data.length }));
        } catch (error) {
            console.error('Error loading floors:', error);
        } finally {
            setLoadingFloors(prev => ({ ...prev, [areaId]: false }));
        }
    };

    const toggleArea = (areaId) => {
        if (expandedArea === areaId) {
            setExpandedArea(null);
        } else {
            setExpandedArea(areaId);
            if (!floors[areaId]) {
                loadFloorsForArea(areaId);
            }
        }
    };

    return {
        areas,
        areasLoading,
        expandedArea,
        floors,
        loadingFloors,
        floorsCount,
        toggleArea,
        loadFloorsForArea,
        loadFloorsCountForAllAreas,
        loadAreas
    };
};
