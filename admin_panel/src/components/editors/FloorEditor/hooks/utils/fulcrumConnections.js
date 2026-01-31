const filterActiveFulcrums = (fulcrums = []) => {
    return fulcrums.filter((fulcrum) => !fulcrum.deleted);
};

const buildConnectionsFromFulcrums = (fulcrums = []) => {
    const allConnections = [];

    fulcrums.forEach((fulcrum) => {
        if (!fulcrum.connections) {
            return;
        }

        fulcrum.connections.forEach((connection) => {
            allConnections.push({
                from: fulcrum.id,
                to: connection.connectedFulcrumId,
                weight: connection.weight
            });
        });
    });

    return allConnections;
};

export { filterActiveFulcrums, buildConnectionsFromFulcrums };
