export const getFloorLabel = (level) => {
    if (level === 0) return 'Паркинг';
    if (level === 1) return '1 этаж';
    if (level > 1) return `${level} этаж`;
    if (level < 0) return `Подвал ${Math.abs(level)}`;
    return `Уровень ${level}`;
};

export const sortFloorsByLevel = (floors) => {
    return floors?.sort((a, b) => (a.level || 0) - (b.level || 0)) || [];
};

export const hasSvgPlan = (floor) => {
    return !!floor?.svgPlan;
};