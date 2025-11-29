// Типы для точек fulcrum
import {FULCRUM_TYPES} from "../../../types/editorTypes";

export const FULCRUM_POINT_VARIANTS = {
    [FULCRUM_TYPES.ROOM]: 'room',
    [FULCRUM_TYPES.CORRIDOR]: 'corridor',
    [FULCRUM_TYPES.STAIRS]: 'stairs',
    [FULCRUM_TYPES.ELEVATOR]: 'elevator',
    [FULCRUM_TYPES.ENTRANCE]: 'entrance',
    [FULCRUM_TYPES.HALL]: 'hall',
    [FULCRUM_TYPES.RESTROOM]: 'restroom',
    [FULCRUM_TYPES.KITCHEN]: 'kitchen',
    [FULCRUM_TYPES.RECEPTION]: 'reception',
    [FULCRUM_TYPES.EMERGENCY_EXIT]: 'emergency_exit',
    [FULCRUM_TYPES.LANDMARK]: 'landmark'
};

export const FULCRUM_POINT_ICONS = {
    [FULCRUM_TYPES.ROOM]: '🏠',
    [FULCRUM_TYPES.CORRIDOR]: '🚶',
    [FULCRUM_TYPES.STAIRS]: '🪜',
    [FULCRUM_TYPES.ELEVATOR]: '🛗',
    [FULCRUM_TYPES.ENTRANCE]: '🚪',
    [FULCRUM_TYPES.HALL]: '🏛️',
    [FULCRUM_TYPES.RESTROOM]: '🚻',
    [FULCRUM_TYPES.KITCHEN]: '🍳',
    [FULCRUM_TYPES.RECEPTION]: '💼',
    [FULCRUM_TYPES.EMERGENCY_EXIT]: '🚨',
    [FULCRUM_TYPES.LANDMARK]: '📍'
};