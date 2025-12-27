import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { floorAPI, fulcrumAPI, navigationAPI } from '../../services/api';
import NavigationMap from '../../components/NavigationMap/NavigationMap';
import './Navigation.css';

const parseId = (value) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const Navigation = () => {
    const [searchParams] = useSearchParams();
    const fulcrumId = parseId(searchParams.get('fulcrum'));
    const toId = parseId(searchParams.get('to'));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [floor, setFloor] = useState(null);
    const [startFulcrum, setStartFulcrum] = useState(null);
    const [route, setRoute] = useState(null);

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
            setRoute(null);

            try {
                const [fulcrumResponse, floorResponse] = await Promise.all([
                    fulcrumAPI.getById(fulcrumId),
                    floorAPI.getByFulcrumId(fulcrumId)
                ]);

                if (!isActive) return;

                setStartFulcrum(fulcrumResponse.data);
                setFloor(floorResponse.data);

                if (toId) {
                    const routeResponse = await navigationAPI.findPath({
                        startFulcrumId: fulcrumId,
                        endFulcrumId: toId
                    });
                    if (!isActive) return;
                    setRoute(routeResponse.data);
                }
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
    }, [fulcrumId, toId]);

    const displayedFulcrums = useMemo(() => {
        if (!startFulcrum) return [];
        const rawPath = route?.path?.length ? route.path : [startFulcrum];
        if (!floor) return rawPath;
        return rawPath.filter((item) => item.floorId === floor.id);
    }, [route, startFulcrum, floor]);

    if (loading) {
        return (
            <div className="navigation-state">
                <div className="spinner" />
                <p>Loading map...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="navigation-state">
                <h2>Unable to load map</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!floor?.svgPlan) {
        return (
            <div className="navigation-state">
                <h2>No map available</h2>
                <p>The selected floor does not have an SVG plan.</p>
            </div>
        );
    }

    return (
        <div className="navigation-page">
            <NavigationMap
                svgContent={floor.svgPlan}
                fulcrums={displayedFulcrums}
                routePath={displayedFulcrums}
                focusFulcrum={startFulcrum}
                endFulcrumId={route?.endFulcrumId}
            />
        </div>
    );
};

export default Navigation;
