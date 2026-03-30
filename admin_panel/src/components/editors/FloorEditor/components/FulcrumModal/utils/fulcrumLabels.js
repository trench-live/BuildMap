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
        [FULCRUM_TYPES.WAYPOINT]: 'Промежуточная точка',
        [FULCRUM_TYPES.ROOM]: '\u041a\u043e\u043c\u043d\u0430\u0442\u0430',
        [FULCRUM_TYPES.STAIRS]: '\u041b\u0435\u0441\u0442\u043d\u0438\u0446\u0430',
        [FULCRUM_TYPES.ELEVATOR]: '\u041b\u0438\u0444\u0442',
        [FULCRUM_TYPES.ENTRANCE]: '\u0412\u0445\u043e\u0434',
        [FULCRUM_TYPES.HALL]: '\u0417\u0430\u043b',
        [FULCRUM_TYPES.RESTROOM]: '\u0422\u0443\u0430\u043b\u0435\u0442',
        [FULCRUM_TYPES.KITCHEN]: '\u041a\u0443\u0445\u043d\u044f',
        [FULCRUM_TYPES.RECEPTION]: '\u0420\u0435\u0441\u0435\u043f\u0448\u0435\u043d',
        [FULCRUM_TYPES.EMERGENCY_EXIT]: '\u0410\u0432\u0430\u0440\u0438\u0439\u043d\u044b\u0439 \u0432\u044b\u0445\u043e\u0434',
        [FULCRUM_TYPES.LANDMARK]: '\u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440'
    };
    return labels[type] || type;
};

export { getFacingLabel, getTypeLabel };
