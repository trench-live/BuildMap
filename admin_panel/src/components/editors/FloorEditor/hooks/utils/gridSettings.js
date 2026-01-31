const GRID_STEP_DEFAULT = 0.04;
const GRID_STEP_MIN = 0.005;
const GRID_STEP_MAX = 0.2;
const GRID_OFFSET_STORAGE_PREFIX = 'buildmap.floorEditor.gridOffset.';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const clampGridStep = (value) => {
    if (!Number.isFinite(value)) return GRID_STEP_DEFAULT;
    const clamped = Math.max(GRID_STEP_MIN, Math.min(GRID_STEP_MAX, value));
    return Number(clamped.toFixed(6));
};

const normalizeGridOffset = (offset) => {
    if (!offset || typeof offset !== 'object') {
        return { x: 0, y: 0 };
    }
    const x = Number(offset.x);
    const y = Number(offset.y);
    return {
        x: Number.isFinite(x) ? clamp01(x) : 0,
        y: Number.isFinite(y) ? clamp01(y) : 0
    };
};

const loadGridOffset = (floorId) => {
    if (!floorId) return null;
    try {
        const raw = localStorage.getItem(`${GRID_OFFSET_STORAGE_PREFIX}${floorId}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return normalizeGridOffset(parsed);
    } catch {
        return null;
    }
};

const saveGridOffset = (floorId, offset) => {
    if (!floorId) return;
    try {
        const normalized = normalizeGridOffset(offset);
        localStorage.setItem(
            `${GRID_OFFSET_STORAGE_PREFIX}${floorId}`,
            JSON.stringify(normalized)
        );
    } catch {
        // ignore storage errors
    }
};

export {
    GRID_STEP_DEFAULT,
    GRID_STEP_MIN,
    GRID_STEP_MAX,
    clampGridStep,
    normalizeGridOffset,
    loadGridOffset,
    saveGridOffset
};
