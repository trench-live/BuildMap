import { useEffect } from 'react';
import { navigationAPI } from '../../../services/api';

const useRoute = ({ fulcrumId, selectedEndId, setRoute, setError, onRouteLoaded }) => {
    useEffect(() => {
        let isActive = true;

        const loadRoute = async () => {
            if (!selectedEndId) {
                setRoute(null);
                return;
            }

            try {
                const routeResponse = await navigationAPI.findPath({
                    startFulcrumId: fulcrumId,
                    endFulcrumId: selectedEndId
                });
                if (!isActive) return;
                setRoute(routeResponse.data);
                if (onRouteLoaded) {
                    onRouteLoaded();
                }
            } catch (err) {
                if (!isActive) return;
                const message = err.response?.data?.message || err.message || 'Failed to build route.';
                setError(message);
            }
        };

        loadRoute();

        return () => {
            isActive = false;
        };
    }, [fulcrumId, selectedEndId, setRoute, setError, onRouteLoaded]);
};

export default useRoute;
