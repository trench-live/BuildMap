import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';

const getFacingLabel = (direction) => {
    const labels = {
        [FACING_DIRECTIONS.UP]: 'Up',
        [FACING_DIRECTIONS.RIGHT]: 'Right',
        [FACING_DIRECTIONS.DOWN]: 'Down',
        [FACING_DIRECTIONS.LEFT]: 'Left'
    };
    return labels[direction] || direction;
};

const getTypeLabel = (type) => {
    const labels = {
        [FULCRUM_TYPES.ROOM]: 'Комната',
        [FULCRUM_TYPES.CORRIDOR]: 'Коридор',
        [FULCRUM_TYPES.STAIRS]: 'Лестница',
        [FULCRUM_TYPES.ELEVATOR]: 'Лифт',
        [FULCRUM_TYPES.ENTRANCE]: 'Вход',
        [FULCRUM_TYPES.HALL]: 'Зал',
        [FULCRUM_TYPES.RESTROOM]: 'Туалет',
        [FULCRUM_TYPES.KITCHEN]: 'Кухня',
        [FULCRUM_TYPES.RECEPTION]: 'Ресепшен',
        [FULCRUM_TYPES.EMERGENCY_EXIT]: 'Аварийный выход',
        [FULCRUM_TYPES.LANDMARK]: 'Ориентир'
    };
    return labels[type] || type;
};

export { getFacingLabel, getTypeLabel };
