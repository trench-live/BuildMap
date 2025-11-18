// Типы для связей между fulcrums
export const CONNECTION_STYLES = {
    NORMAL: 'normal',
    HOVERED: 'hovered',
    SELECTED: 'selected',
    TEMPORARY: 'temporary'
};

export const CONNECTION_WEIGHT_COLORS = {
    LOW: '#10b981',    // зеленый для легких путей
    MEDIUM: '#f59e0b', // желтый для средних
    HIGH: '#ef4444'    // красный для сложных
};

// Получение цвета связи на основе веса
export const getConnectionColor = (weight) => {
    if (weight <= 1.0) return CONNECTION_WEIGHT_COLORS.LOW;
    if (weight <= 2.0) return CONNECTION_WEIGHT_COLORS.MEDIUM;
    return CONNECTION_WEIGHT_COLORS.HIGH;
};