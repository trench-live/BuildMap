import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const fulcrumId = parseId(searchParams.get('fulcrum'));
    const toId = parseId(searchParams.get('to'));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [floors, setFloors] = useState([]);
    const [activeFloorId, setActiveFloorId] = useState(null);
    const [startFulcrum, setStartFulcrum] = useState(null);
    const [route, setRoute] = useState(null);
    const [areaId, setAreaId] = useState(null);
    const [areaFulcrums, setAreaFulcrums] = useState([]);
    const [selectedEndId, setSelectedEndId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        setSelectedEndId(toId ?? null);
    }, [fulcrumId]);

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
            setAreaId(null);
            setAreaFulcrums([]);

            try {
                const fulcrumResponse = await fulcrumAPI.getById(fulcrumId);

                if (!isActive) return;

                const startData = fulcrumResponse.data;
                setStartFulcrum(startData);

                let areaIdValue = startData?.mappingAreaId;
                if (!areaIdValue) {
                    const floorResponse = await floorAPI.getByFulcrumId(fulcrumId);
                    areaIdValue = floorResponse.data?.mappingAreaId;
                }

                if (!areaIdValue) {
                    throw new Error('Mapping area not found for this fulcrum.');
                }

                const [floorsResponse, fulcrumsResponse] = await Promise.all([
                    floorAPI.getByArea(areaIdValue),
                    fulcrumAPI.getByArea(areaIdValue)
                ]);

                if (!isActive) return;

                const sortedFloors = (floorsResponse.data || []).slice().sort((a, b) => {
                    const aLevel = Number.isFinite(a.level) ? a.level : Number.MAX_SAFE_INTEGER;
                    const bLevel = Number.isFinite(b.level) ? b.level : Number.MAX_SAFE_INTEGER;
                    return aLevel - bLevel;
                });
                setFloors(sortedFloors);
                setAreaId(areaIdValue);
                setAreaFulcrums((fulcrumsResponse.data || []).filter((item) => !item.deleted));
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
    }, [fulcrumId]);

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
    }, [fulcrumId, selectedEndId]);

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

    useEffect(() => {
        if (!selectedEndId) return;
        if (!areaFulcrums.length) return;
        const selected = areaFulcrums.find((item) => item.id === selectedEndId);
        if (selected && selected.name && searchValue !== selected.name) {
            setSearchValue(selected.name);
        }
    }, [areaFulcrums, selectedEndId, searchValue]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!searchRef.current) return;
            if (searchRef.current.contains(event.target)) return;
            setSearchOpen(false);
            searchInputRef.current?.blur();
        };

        window.addEventListener('pointerdown', handlePointerDown);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
        };
    }, []);

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

    const floorLabelMap = useMemo(() => {
        const map = new Map();
        floors.forEach((floorItem) => {
            if (floorItem?.id == null) return;
            if (floorItem.name) {
                map.set(floorItem.id, floorItem.name);
            } else if (Number.isFinite(floorItem.level)) {
                map.set(floorItem.id, `Level ${floorItem.level}`);
            }
        });
        return map;
    }, [floors]);

    const floorLevelMap = useMemo(() => {
        const map = new Map();
        floors.forEach((floorItem) => {
            if (floorItem?.id == null) return;
            const level = Number.isFinite(floorItem.level) ? floorItem.level : Number.MAX_SAFE_INTEGER;
            map.set(floorItem.id, level);
        });
        return map;
    }, [floors]);

    const formatFloorLabel = (floorItem) => {
        if (!floorItem) return 'Floor';
        if (floorItem.name) return floorItem.name;
        if (Number.isFinite(floorItem.level)) return `L${floorItem.level}`;
        return `Floor ${floorItem.id}`;
    };

    const searchResults = useMemo(() => {
        if (!areaFulcrums.length) return [];
        const query = searchValue.trim().toLowerCase();
        const candidates = areaFulcrums.filter(
            (item) => item.id !== startFulcrum?.id && item.type !== 'CORRIDOR'
        );
        if (!query) {
            return candidates
                .slice()
                .sort((a, b) => {
                    const levelA = floorLevelMap.get(a.floorId) ?? Number.MAX_SAFE_INTEGER;
                    const levelB = floorLevelMap.get(b.floorId) ?? Number.MAX_SAFE_INTEGER;
                    if (levelA !== levelB) return levelA - levelB;
                    return (a.name || '').localeCompare(b.name || '');
                });
        }

        const scored = candidates
            .map((item) => {
                const name = item.name || '';
                const nameLower = name.toLowerCase();
                if (!nameLower.includes(query)) return null;
                const matchRank = nameLower.startsWith(query) ? 0 : 1;
                const level = floorLevelMap.get(item.floorId) ?? Number.MAX_SAFE_INTEGER;
                return {
                    item,
                    matchRank,
                    level,
                    name
                };
            })
            .filter(Boolean);

        scored.sort((a, b) => {
            if (a.matchRank !== b.matchRank) return a.matchRank - b.matchRank;
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });

        return scored.map((entry) => entry.item);
    }, [areaFulcrums, floorLevelMap, searchValue, startFulcrum]);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        setSelectedEndId(null);
        if (!value.trim()) {
            setSearchParams((params) => {
                const next = new URLSearchParams(params);
                next.delete('to');
                return next;
            }, { replace: true });
        }
        setSearchOpen(true);
    };

    const handleSelectDestination = (fulcrum) => {
        setSelectedEndId(fulcrum.id);
        setSearchValue(fulcrum.name || '');
        setSearchOpen(false);
        setSearchParams((params) => {
            const next = new URLSearchParams(params);
            next.set('to', fulcrum.id);
            return next;
        }, { replace: true });
    };

    const handleSearchFocus = () => {
        setSearchOpen(true);
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
            <div className="navigation-search" ref={searchRef}>
                <input
                    type="search"
                    className={`navigation-search-input${searchOpen ? ' is-open' : ''}`}
                    placeholder="Search destination"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    ref={searchInputRef}
                />
                {searchOpen && (
                    <div className="navigation-search-results">
                        {searchResults.length ? (
                            searchResults.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    className="navigation-search-item"
                                    onClick={() => handleSelectDestination(item)}
                                >
                                    <span className="navigation-search-name">
                                        {item.name}
                                        <span className="navigation-search-divider"> — </span>
                                        <span className="navigation-search-floor">
                                            {floorLabelMap.get(item.floorId) || 'Floor'}
                                        </span>
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="navigation-search-empty">No matches</div>
                        )}
                    </div>
                )}
            </div>
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
