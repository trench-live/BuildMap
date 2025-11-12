import { useState, useEffect } from 'react';
import { floorAPI, mappingAreaAPI } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';

export const useFloors = () => {
    const [expandedArea, setExpandedArea] = useState(null);
    const [floors, setFloors] = useState({});
    const [loadingFloors, setLoadingFloors] = useState({});
    const [floorsCount, setFloorsCount] = useState({});

    const { data: areas, loading: areasLoading, execute: loadAreas } = useApi(() => mappingAreaAPI.getAll(false));

    useEffect(() => {
        if (areas && areas.length > 0) {
            loadFloorsCountForAllAreas();
        }
    }, [areas]);

    const loadFloorsCountForAllAreas = async () => {
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
    };

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