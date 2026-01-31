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

    const normalizeConnectionWeight = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) return 1;
        return parsed;
    };

    const syncInterfloorConnections = async (fulcrumId, rows = []) => {
        for (const row of rows) {
            if (row.forwardEnabled) {
                await removeConnection(fulcrumId, row.id);
                await addConnection(fulcrumId, {
                    connectedFulcrumId: row.id,
                    weight: normalizeConnectionWeight(row.forwardWeight)
                });
            } else {
                await removeConnection(fulcrumId, row.id);
            }

            if (row.backwardEnabled) {
                await removeConnection(row.id, fulcrumId);
                await addConnection(row.id, {
                    connectedFulcrumId: fulcrumId,
                    weight: normalizeConnectionWeight(row.backwardWeight)
                });
            } else {
                await removeConnection(row.id, fulcrumId);
            }
        }
    };

    const handleFulcrumCreate = (position) => {
        setFulcrumModal({
            visible: true,
            mode: 'create',
            fulcrum: null,
            position: position
        });
    };

    const handleFulcrumContextMenu = (fulcrum, event) => {
        event.preventDefault();
        event.stopPropagation();

        setFulcrumModal({
            visible: true,
            mode: 'edit',
            fulcrum: fulcrum,
            position: null
        });
    };

    const handleConnectionCreate = (fromFulcrum, toFulcrum) => {
        setConnectionModal({
            visible: true,
            mode: 'create',
            connection: null,
            fromFulcrum: fromFulcrum,
            toFulcrum: toFulcrum,
            isBidirectional: true
        });
    };

    const handleConnectionContextMenu = (connection, event) => {
        event.preventDefault();
        event.stopPropagation();

        const fromFulcrum = fulcrums.find(f => f.id === connection.from);
        const toFulcrum = fulcrums.find(f => f.id === connection.to);
        const hasReverseConnection = connections.some(conn =>
            conn.from === connection.to && conn.to === connection.from
        );

        setConnectionModal({
            visible: true,
            mode: 'edit',
            connection: connection,
            fromFulcrum: fromFulcrum,
            toFulcrum: toFulcrum,
            isBidirectional: hasReverseConnection
        });
    };

    const handleFulcrumSave = async (payload) => {
        const { fulcrumData, connectionRows } = payload;
        try {
            if (fulcrumModal.mode === 'create') {
                const newFulcrum = await createFulcrum(fulcrumData);
                await syncInterfloorConnections(newFulcrum.id, connectionRows);
                console.log('Fulcrum created:', newFulcrum);
            } else {
                const updatedFulcrum = await updateFulcrum(fulcrumModal.fulcrum.id, fulcrumData);
                await syncInterfloorConnections(updatedFulcrum.id, connectionRows);
                console.log('Fulcrum updated');
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
            const weight = connectionData.weight;
            const bidirectional = connectionData.bidirectional;
            const reverseExists = connections.some(conn =>
                conn.from === toId && conn.to === fromId
            );

            if (connectionModal.mode === 'create') {
                await addConnection(fromId, {
                    connectedFulcrumId: toId,
                    weight
                });

                if (bidirectional) {
                    if (reverseExists) {
                        await removeConnection(toId, fromId);
                    }
                    await addConnection(toId, {
                        connectedFulcrumId: fromId,
                        weight
                    });
                }

                console.log('Connection created');
            } else {
                await removeConnection(connectionModal.connection.from, connectionModal.connection.to);
                await addConnection(fromId, {
                    connectedFulcrumId: toId,
                    weight
                });

                if (bidirectional) {
                    if (reverseExists) {
                        await removeConnection(toId, fromId);
                    }
                    await addConnection(toId, {
                        connectedFulcrumId: fromId,
                        weight
                    });
                } else if (reverseExists) {
                    await removeConnection(toId, fromId);
                }

                console.log('Connection updated');
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
