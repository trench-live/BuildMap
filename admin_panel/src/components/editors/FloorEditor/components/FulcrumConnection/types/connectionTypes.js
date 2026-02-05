// Типы для связей между fulcrums
export const CONNECTION_STYLES = {
    NORMAL: 'normal',
    HOVERED: 'hovered',
    SELECTED: 'selected',
    TEMPORARY: 'temporary'
};

export const CONNECTION_WEIGHT_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444'
};

export const CONNECTION_DIRECTION = {
    UNIDIRECTIONAL: 'unidirectional',
    BIDIRECTIONAL: 'bidirectional'
};

// Получение цвета связи на основе веса
export const getConnectionColor = (weight) => {
    if (weight <= 1.0) return CONNECTION_WEIGHT_COLORS.LOW;
    if (weight <= 2.0) return CONNECTION_WEIGHT_COLORS.MEDIUM;
    return CONNECTION_WEIGHT_COLORS.HIGH;
};

// Определение направленности связи
export const getConnectionDirection = (fromFulcrumId, toFulcrumId, allConnections) => {
    const reverseConnection = allConnections.find(conn =>
        conn.from === toFulcrumId && conn.to === fromFulcrumId
    );

    return reverseConnection
        ? CONNECTION_DIRECTION.BIDIRECTIONAL
        : CONNECTION_DIRECTION.UNIDIRECTIONAL;
};