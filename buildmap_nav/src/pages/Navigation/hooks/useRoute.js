import { useEffect } from 'react';
import { navigationAPI } from '../../../services/api';

const useRoute = ({
    fulcrumId,
    selectedEndId,
    setRoute,
    setRouteError,
    onRouteLoaded,
    onRouteError
}) => {
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
                setRouteError?.(null);
                if (onRouteLoaded) {
                    onRouteLoaded();
                }
            } catch (err) {
                if (!isActive) return;
                const message = err.response?.data?.message || err.message || 'Failed to build route.';
                setRoute(null);
                setRouteError?.(message);
                onRouteError?.(message);
            }
        };

        loadRoute();

        return () => {
            isActive = false;
        };
    }, [fulcrumId, selectedEndId, setRoute, setRouteError, onRouteLoaded, onRouteError]);
};

export default useRoute;
