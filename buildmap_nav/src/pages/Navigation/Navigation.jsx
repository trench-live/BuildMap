import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavigationSearch from './components/NavigationSearch';
import NavigationLayers from './components/NavigationLayers';
import NavigationStepsPanel from './components/NavigationStepsPanel';
import FloorSwitcher from './components/FloorSwitcher';
import useNavigationData from './hooks/useNavigationData';
import useRoute from './hooks/useRoute';
import useFocusState from './hooks/useFocusState';
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

    const [activeFloorId, setActiveFloorId] = useState(null);
    const [route, setRoute] = useState(null);
    const [selectedEndId, setSelectedEndId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [stepsOpen, setStepsOpen] = useState(true);
    const [selectedStepKey, setSelectedStepKey] = useState(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const stepsRef = useRef(null);

    const handleDataReset = useCallback(() => {
        setRoute(null);
        setActiveFloorId(null);
    }, [setRoute, setActiveFloorId]);

    const handleRouteLoaded = useCallback(() => {
        setSelectedStepKey(null);
    }, [setSelectedStepKey]);

    const {
        loading,
        error,
        setError,
        floors,
        areaFulcrums,
        startFulcrum
    } = useNavigationData(fulcrumId, handleDataReset);

    useRoute({
        fulcrumId,
        selectedEndId,
        setRoute,
        setError,
        onRouteLoaded: handleRouteLoaded
    });

    const {
        focusTargets,
        focusSegments,
        focusAnimate,
        stepsPanelHeight,
        onStepClick,
        onFloorSelect
    } = useFocusState({
        route,
        activeFloorId,
        setActiveFloorId,
        stepsOpen,
        stepsRef,
        setSelectedStepKey
    });

    useEffect(() => {
        setSelectedEndId(toId ?? null);
    }, [fulcrumId]);

    useEffect(() => {
        if (selectedEndId) {
            setStepsOpen(true);
        }
    }, [selectedEndId]);

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

    useEffect(() => {
        if (!selectedEndId) return;
        const handlePointerDown = (event) => {
            if (!stepsRef.current) return;
            if (stepsRef.current.contains(event.target)) return;
            setStepsOpen(false);
        };

        window.addEventListener('pointerdown', handlePointerDown);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [selectedEndId]);

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
            <NavigationSearch
                searchRef={searchRef}
                searchInputRef={searchInputRef}
                searchOpen={searchOpen}
                searchValue={searchValue}
                searchResults={searchResults}
                floorLabelMap={floorLabelMap}
                onSearchChange={handleSearchChange}
                onSearchFocus={handleSearchFocus}
                onSelectDestination={handleSelectDestination}
            />
            <NavigationLayers
                floors={floors}
                activeFloorId={activeFloorId}
                activeMarkers={activeMarkers}
                activeSegments={activeSegments}
                focusFulcrum={focusFulcrum}
                route={route}
                focusTargets={focusTargets}
                focusSegments={focusSegments}
                focusAnimate={focusAnimate}
                stepsOpen={stepsOpen}
                stepsPanelHeight={stepsPanelHeight}
            />
            <NavigationStepsPanel
                selectedEndId={selectedEndId}
                stepsOpen={stepsOpen}
                stepsRef={stepsRef}
                route={route}
                selectedStepKey={selectedStepKey}
                onToggleSteps={() => setStepsOpen((prev) => !prev)}
                onStepClick={onStepClick}
            />
            <FloorSwitcher
                floors={floors}
                activeFloorId={activeFloorId}
                formatFloorLabel={formatFloorLabel}
                onFloorSelect={onFloorSelect}
            />
        </div>
    );
};

export default Navigation;
