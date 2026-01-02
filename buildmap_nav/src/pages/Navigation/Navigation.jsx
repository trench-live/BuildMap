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
    const [floors, setFloors] = useState([]);
    const [activeFloorId, setActiveFloorId] = useState(null);
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
            setFloors([]);
            setActiveFloorId(null);

            try {
                const fulcrumResponse = await fulcrumAPI.getById(fulcrumId);
                const routePromise = toId ? navigationAPI.findPath({
                    startFulcrumId: fulcrumId,
                    endFulcrumId: toId
                }) : Promise.resolve(null);

                if (!isActive) return;

                const startData = fulcrumResponse.data;
                setStartFulcrum(startData);

                let areaId = startData?.mappingAreaId;
                if (!areaId) {
                    const floorResponse = await floorAPI.getByFulcrumId(fulcrumId);
                    areaId = floorResponse.data?.mappingAreaId;
                }

                if (!areaId) {
                    throw new Error('Mapping area not found for this fulcrum.');
                }

                const [floorsResponse, routeResponse] = await Promise.all([
                    floorAPI.getByArea(areaId),
                    routePromise
                ]);

                if (!isActive) return;

                const sortedFloors = (floorsResponse.data || []).slice().sort((a, b) => {
                    const aLevel = Number.isFinite(a.level) ? a.level : Number.MAX_SAFE_INTEGER;
                    const bLevel = Number.isFinite(b.level) ? b.level : Number.MAX_SAFE_INTEGER;
                    return aLevel - bLevel;
                });
                setFloors(sortedFloors);
                if (routeResponse?.data) {
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

    useEffect(() => {
        if (!floors.length) return;
        setActiveFloorId((current) => {
            if (current && floors.some((floor) => floor.id === current)) {
                return current;
            }
            if (startFulcrum?.floorId && floors.some((floor) => floor.id === startFulcrum.floorId)) {
                return startFulcrum.floorId;
            }
            return floors[0]?.id ?? null;
        });
    }, [floors, startFulcrum]);

    const activeFloor = useMemo(
        () => floors.find((item) => item.id === activeFloorId) ?? null,
        [floors, activeFloorId]
    );

    const activeMarkers = useMemo(() => {
        if (!activeFloorId) return [];
        if (route?.path?.length) {
            return route.path.filter((item) => item.floorId === activeFloorId);
        }
        if (startFulcrum?.floorId === activeFloorId) {
            return [startFulcrum];
        }
        return [];
    }, [route, startFulcrum, activeFloorId]);

    const activeSegments = useMemo(() => {
        if (!route?.path?.length || !activeFloorId) return [];
        const items = [];
        for (let i = 0; i < route.path.length - 1; i += 1) {
            const from = route.path[i];
            const to = route.path[i + 1];
            if (from.floorId === activeFloorId && to.floorId === activeFloorId) {
                items.push([from, to]);
            }
        }
        return items;
    }, [route, activeFloorId]);

    const focusFulcrum = useMemo(() => {
        if (activeMarkers.length) {
            return activeMarkers[0];
        }
        return null;
    }, [activeMarkers]);

    const formatFloorLabel = (floorItem) => {
        if (!floorItem) return 'Floor';
        if (floorItem.name) return floorItem.name;
        if (Number.isFinite(floorItem.level)) return `L${floorItem.level}`;
        return `Floor ${floorItem.id}`;
    };

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

    if (!floors.length) {
        return (
            <div className="navigation-state">
                <h2>No floors available</h2>
                <p>This building does not have any floors configured yet.</p>
            </div>
        );
    }

    return (
        <div className="navigation-page">
            <div className="navigation-layers">
                {floors.map((floorItem) => {
                    const isActive = floorItem.id === activeFloorId;
                    return (
                        <div
                            key={floorItem.id}
                            className={`navigation-layer${isActive ? ' is-active' : ''}`}
                        >
                            {floorItem.svgPlan ? (
                                <NavigationMap
                                    svgContent={floorItem.svgPlan}
                                    fulcrums={isActive ? activeMarkers : []}
                                    routeSegments={isActive ? activeSegments : []}
                                    focusFulcrum={isActive ? focusFulcrum : null}
                                    endFulcrumId={isActive ? route?.endFulcrumId : null}
                                />
                            ) : (
                                <div className="navigation-layer-placeholder">
                                    <h2>No map available</h2>
                                    <p>This floor does not have an SVG plan yet.</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="floor-switcher" role="tablist" aria-label="Floors">
                <span className="floor-switcher-label">Floors</span>
                <div className="floor-switcher-list">
                    {floors.map((floorItem) => {
                        const isActive = floorItem.id === activeFloorId;
                        return (
                            <button
                                key={floorItem.id}
                                type="button"
                                className={`floor-switcher-button${isActive ? ' is-active' : ''}`}
                                onClick={() => setActiveFloorId(floorItem.id)}
                                aria-pressed={isActive}
                                title={floorItem.name || undefined}
                            >
                                {formatFloorLabel(floorItem)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Navigation;
