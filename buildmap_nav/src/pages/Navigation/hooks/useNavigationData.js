import { useEffect, useState } from 'react';
import { floorAPI, fulcrumAPI } from '../../../services/api';

const useNavigationData = (fulcrumId, onReset) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [floors, setFloors] = useState([]);
    const [startFulcrum, setStartFulcrum] = useState(null);
    const [areaId, setAreaId] = useState(null);
    const [areaFulcrums, setAreaFulcrums] = useState([]);

    useEffect(() => {
        if (!fulcrumId) {
            setError('Missing fulcrum id in URL.');
            setLoading(false);
            return;
        }

        let isActive = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            if (onReset) {
                onReset();
            }
            setFloors([]);
            setStartFulcrum(null);
            setAreaId(null);
            setAreaFulcrums([]);

            try {
                const floorResponse = await floorAPI.getByFulcrumId(fulcrumId);
                if (!isActive) return;

                const areaIdValue = floorResponse.data?.mappingAreaId;

                if (!areaIdValue) {
                    throw new Error('Mapping area not found for this fulcrum.');
                }

                const [floorsResponse, fulcrumsResponse] = await Promise.all([
                    floorAPI.getByArea(areaIdValue),
                    fulcrumAPI.getByArea(areaIdValue)
                ]);

                if (!isActive) return;

                const allFulcrums = fulcrumsResponse.data || [];
                const startData = allFulcrums.find((item) => item.id === fulcrumId) || null;
                if (!startData) {
                    throw new Error('Start point not found in this area.');
                }

                const sortedFloors = (floorsResponse.data || []).slice().sort((a, b) => {
                    const aLevel = Number.isFinite(a.level) ? a.level : Number.MAX_SAFE_INTEGER;
                    const bLevel = Number.isFinite(b.level) ? b.level : Number.MAX_SAFE_INTEGER;
                    return aLevel - bLevel;
                });
                setStartFulcrum(startData);
                setFloors(sortedFloors);
                setAreaId(areaIdValue);
                setAreaFulcrums(allFulcrums.filter((item) => !item.deleted));
            } catch (err) {
                if (!isActive) return;
                const message = err.response?.data?.message || err.message || 'Failed to load navigation data.';
                setError(message);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, [fulcrumId, onReset]);

    return {
        loading,
        error,
        setError,
        floors,
        startFulcrum,
        areaId,
        areaFulcrums
    };
};

export default useNavigationData;
