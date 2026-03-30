export const CONNECTION_STYLES = {
    NORMAL: 'normal',
    HOVERED: 'hovered',
    SELECTED: 'selected',
    TEMPORARY: 'temporary'
};

export const CONNECTION_COST_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444'
};

export const CONNECTION_DIRECTION = {
    UNIDIRECTIONAL: 'unidirectional',
    BIDIRECTIONAL: 'bidirectional'
};

export const getConnectionColor = (costValue) => {
    if (costValue <= 1.0) return CONNECTION_COST_COLORS.LOW;
    if (costValue <= 2.0) return CONNECTION_COST_COLORS.MEDIUM;
    return CONNECTION_COST_COLORS.HIGH;
};

export const getConnectionDirection = (fromFulcrumId, toFulcrumId, allConnections) => {
    const reverseConnection = allConnections.find(conn =>
        conn.from === toFulcrumId && conn.to === fromFulcrumId
    );

    return reverseConnection
        ? CONNECTION_DIRECTION.BIDIRECTIONAL
        : CONNECTION_DIRECTION.UNIDIRECTIONAL;
};
