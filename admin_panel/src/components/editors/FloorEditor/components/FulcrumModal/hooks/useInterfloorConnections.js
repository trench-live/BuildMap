import { useCallback, useEffect, useState } from 'react';
import { floorAPI, fulcrumAPI } from '../../../../../../services/api';
import { FULCRUM_TYPES } from '../../../types/editorTypes';

const useInterfloorConnections = ({
    visible,
    mappingAreaId,
    fulcrumId,
    floorId
}) => {
    const [connectionRows, setConnectionRows] = useState([]);
    const [connectionErrors, setConnectionErrors] = useState({});
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [connectionsError, setConnectionsError] = useState(null);

    const buildConnectionRows = useCallback((allFulcrums, floorNameById, currentFulcrumId, currentFloorId) => {
        const currentFulcrum = allFulcrums.find(item => item.id === currentFulcrumId);
        const outgoingConnections = new Map();
        const incomingConnections = new Map();

        if (currentFulcrum?.connections) {
            currentFulcrum.connections.forEach(connection => {
                outgoingConnections.set(connection.connectedFulcrumId, connection.weight);
            });
        }

        allFulcrums.forEach(item => {
            if (!item?.connections) return;
            const incoming = item.connections.find(connection => connection.connectedFulcrumId === currentFulcrumId);
            if (incoming) {
                incomingConnections.set(item.id, incoming.weight);
            }
        });

        return allFulcrums
            .filter(item => !item.deleted)
            .filter(item => item.id !== currentFulcrumId)
            .filter(item => item.floorId !== currentFloorId)
            .filter(item => item.type !== FULCRUM_TYPES.CORRIDOR)
            .map(item => ({
                id: item.id,
                name: item.name,
                floorId: item.floorId,
                floorName: floorNameById.get(item.floorId) || `Floor ${item.floorId}`,
                forwardEnabled: outgoingConnections.has(item.id),
                forwardWeight: outgoingConnections.get(item.id) ?? 1,
                backwardEnabled: incomingConnections.has(item.id),
                backwardWeight: incomingConnections.get(item.id) ?? 1
            }))
            .sort((a, b) => {
                if (a.floorName === b.floorName) {
                    return a.name.localeCompare(b.name);
                }
                return a.floorName.localeCompare(b.floorName);
            });
    }, []);

    useEffect(() => {
        if (!visible || !mappingAreaId) {
            setConnectionRows([]);
            setConnectionErrors({});
            setConnectionsError(null);
            return;
        }

        let isMounted = true;
        const loadConnections = async () => {
            setConnectionsLoading(true);
            setConnectionsError(null);

            try {
                const [floorsResponse, fulcrumsResponse] = await Promise.all([
                    floorAPI.getByArea(mappingAreaId, false),
                    fulcrumAPI.getByArea(mappingAreaId, false)
                ]);

                if (!isMounted) return;

                const floorNameById = new Map();
                floorsResponse.data.forEach(item => {
                    floorNameById.set(item.id, item.name);
                });

                const rows = buildConnectionRows(
                    fulcrumsResponse.data,
                    floorNameById,
                    fulcrumId ?? null,
                    floorId ?? null
                );

                setConnectionRows(rows);
                setConnectionErrors({});
            } catch (error) {
                if (!isMounted) return;
                setConnectionsError(error.response?.data?.message || error.message || 'Failed to load connections.');
            } finally {
                if (isMounted) {
                    setConnectionsLoading(false);
                }
            }
        };

        loadConnections();

        return () => {
            isMounted = false;
        };
    }, [visible, mappingAreaId, fulcrumId, floorId, buildConnectionRows]);

    const updateConnectionRow = (rowId, field, value) => {
        setConnectionRows(prev => prev.map(row => {
            if (row.id !== rowId) return row;
            return {
                ...row,
                [field]: value
            };
        }));
    };

    const clearConnectionError = (rowId, field) => {
        setConnectionErrors(prev => {
            if (!prev[rowId]) return prev;
            const next = { ...prev[rowId] };
            delete next[field];
            const rest = { ...prev };
            if (Object.keys(next).length === 0) {
                delete rest[rowId];
            } else {
                rest[rowId] = next;
            }
            return rest;
        });
    };

    const isValidWeight = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 1;
    };

    const normalizeWeight = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) return 1;
        return parsed;
    };

    return {
        connectionRows,
        connectionErrors,
        connectionsLoading,
        connectionsError,
        updateConnectionRow,
        clearConnectionError,
        setConnectionErrors,
        isValidWeight,
        normalizeWeight
    };
};

export default useInterfloorConnections;
