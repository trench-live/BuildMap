import { useState } from 'react';

const createFulcrumModalState = () => ({
    visible: false,
    mode: 'create',
    fulcrum: null,
    position: null
});

const createConnectionModalState = () => ({
    visible: false,
    mode: 'create',
    connection: null,
    fromFulcrum: null,
    toFulcrum: null,
    isBidirectional: true
});

const useEditorModals = ({
    fulcrums,
    connections,
    createFulcrum,
    updateFulcrum,
    deleteFulcrum,
    addConnection,
    removeConnection
}) => {
    const [fulcrumModal, setFulcrumModal] = useState(createFulcrumModalState);
    const [connectionModal, setConnectionModal] = useState(createConnectionModalState);

    const normalizeDistanceMeters = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return 1;
        return parsed;
    };

    const normalizeDifficultyFactor = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) return 1;
        return parsed;
    };

    const hasConnectionChanged = (
        nextEnabled,
        currentEnabled,
        nextDistanceMeters,
        currentDistanceMeters,
        nextDifficultyFactor,
        currentDifficultyFactor
    ) => {
        if (nextEnabled !== currentEnabled) {
            return true;
        }

        if (!nextEnabled) {
            return false;
        }

        return normalizeDistanceMeters(nextDistanceMeters) !== normalizeDistanceMeters(currentDistanceMeters)
            || normalizeDifficultyFactor(nextDifficultyFactor) !== normalizeDifficultyFactor(currentDifficultyFactor);
    };

    const syncInterfloorConnections = async (fulcrumId, rows = []) => {
        for (const row of rows) {
            const forwardChanged = hasConnectionChanged(
                row.forwardEnabled,
                row.currentForwardEnabled,
                row.forwardDistanceMeters,
                row.currentForwardDistanceMeters,
                row.forwardDifficultyFactor,
                row.currentForwardDifficultyFactor
            );

            if (forwardChanged && row.currentForwardEnabled) {
                await removeConnection(fulcrumId, row.id);
            }

            if (forwardChanged && row.forwardEnabled) {
                await addConnection(fulcrumId, {
                    connectedFulcrumId: row.id,
                    distanceMeters: normalizeDistanceMeters(row.forwardDistanceMeters),
                    difficultyFactor: normalizeDifficultyFactor(row.forwardDifficultyFactor)
                });
            }

            const backwardChanged = hasConnectionChanged(
                row.backwardEnabled,
                row.currentBackwardEnabled,
                row.backwardDistanceMeters,
                row.currentBackwardDistanceMeters,
                row.backwardDifficultyFactor,
                row.currentBackwardDifficultyFactor
            );

            if (backwardChanged && row.currentBackwardEnabled) {
                await removeConnection(row.id, fulcrumId);
            }

            if (backwardChanged && row.backwardEnabled) {
                await addConnection(row.id, {
                    connectedFulcrumId: fulcrumId,
                    distanceMeters: normalizeDistanceMeters(row.backwardDistanceMeters),
                    difficultyFactor: normalizeDifficultyFactor(row.backwardDifficultyFactor)
                });
            }
        }
    };

    const handleFulcrumCreate = (position) => {
        setFulcrumModal({
            visible: true,
            mode: 'create',
            fulcrum: null,
            position
        });
    };

    const handleFulcrumContextMenu = (fulcrum, event) => {
        event.preventDefault();
        event.stopPropagation();

        setFulcrumModal({
            visible: true,
            mode: 'edit',
            fulcrum,
            position: null
        });
    };

    const handleConnectionCreate = (fromFulcrum, toFulcrum) => {
        setConnectionModal({
            visible: true,
            mode: 'create',
            connection: null,
            fromFulcrum,
            toFulcrum,
            isBidirectional: true
        });
    };

    const handleConnectionContextMenu = (connection, event) => {
        event.preventDefault();
        event.stopPropagation();

        const fromFulcrum = fulcrums.find((item) => item.id === connection.from);
        const toFulcrum = fulcrums.find((item) => item.id === connection.to);
        const hasReverseConnection = connections.some(
            (item) => item.from === connection.to && item.to === connection.from
        );

        setConnectionModal({
            visible: true,
            mode: 'edit',
            connection,
            fromFulcrum,
            toFulcrum,
            isBidirectional: hasReverseConnection
        });
    };

    const handleFulcrumSave = async (payload) => {
        const { fulcrumData, connectionRows } = payload;

        try {
            if (fulcrumModal.mode === 'create') {
                const newFulcrum = await createFulcrum(fulcrumData);
                await syncInterfloorConnections(newFulcrum.id, connectionRows);
            } else {
                const updatedFulcrum = await updateFulcrum(fulcrumModal.fulcrum.id, fulcrumData);
                await syncInterfloorConnections(updatedFulcrum.id, connectionRows);
            }

            setFulcrumModal(createFulcrumModalState());
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFulcrumDelete = async () => {
        if (fulcrumModal.mode === 'edit' && fulcrumModal.fulcrum) {
            try {
                await deleteFulcrum(fulcrumModal.fulcrum.id);
                setFulcrumModal(createFulcrumModalState());
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleConnectionSave = async (connectionData) => {
        try {
            const fromId = connectionModal.fromFulcrum.id;
            const toId = connectionModal.toFulcrum.id;
            const distanceMeters = normalizeDistanceMeters(connectionData.distanceMeters);
            const difficultyFactor = normalizeDifficultyFactor(connectionData.difficultyFactor);
            const bidirectional = connectionData.bidirectional;
            const reverseExists = connections.some(
                (item) => item.from === toId && item.to === fromId
            );

            if (connectionModal.mode === 'create') {
                await addConnection(fromId, {
                    connectedFulcrumId: toId,
                    distanceMeters,
                    difficultyFactor
                });

                if (bidirectional) {
                    if (reverseExists) {
                        await removeConnection(toId, fromId);
                    }

                    await addConnection(toId, {
                        connectedFulcrumId: fromId,
                        distanceMeters,
                        difficultyFactor
                    });
                }
            } else {
                await removeConnection(connectionModal.connection.from, connectionModal.connection.to);
                await addConnection(fromId, {
                    connectedFulcrumId: toId,
                    distanceMeters,
                    difficultyFactor
                });

                if (bidirectional) {
                    if (reverseExists) {
                        await removeConnection(toId, fromId);
                    }

                    await addConnection(toId, {
                        connectedFulcrumId: fromId,
                        distanceMeters,
                        difficultyFactor
                    });
                } else if (reverseExists) {
                    await removeConnection(toId, fromId);
                }
            }

            setConnectionModal(createConnectionModalState());
        } catch (error) {
            alert(error.message);
        }
    };

    const handleConnectionDelete = async () => {
        if (connectionModal.mode === 'edit' && connectionModal.connection) {
            try {
                await removeConnection(connectionModal.connection.from, connectionModal.connection.to);
                setConnectionModal(createConnectionModalState());
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const closeFulcrumModal = () => setFulcrumModal(createFulcrumModalState());
    const closeConnectionModal = () => setConnectionModal(createConnectionModalState());

    return {
        fulcrumModal,
        connectionModal,
        handleFulcrumCreate,
        handleFulcrumContextMenu,
        handleConnectionCreate,
        handleConnectionContextMenu,
        handleFulcrumSave,
        handleFulcrumDelete,
        handleConnectionSave,
        handleConnectionDelete,
        closeFulcrumModal,
        closeConnectionModal
    };
};

export default useEditorModals;
