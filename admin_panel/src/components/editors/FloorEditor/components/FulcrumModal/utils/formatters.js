const formatCoord = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
    return Number(value).toFixed(3);
};

export { formatCoord };
