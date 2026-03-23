import { FULCRUM_TYPES } from '../../../types/editorTypes';

export const FULCRUM_POINT_VARIANTS = {
    [FULCRUM_TYPES.WAYPOINT]: 'waypoint',
    [FULCRUM_TYPES.ROOM]: 'room',
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
    [FULCRUM_TYPES.WAYPOINT]: '\ud83d\udeb6',
    [FULCRUM_TYPES.ROOM]: '\ud83c\udfe0',
    [FULCRUM_TYPES.STAIRS]: '\ud83e\ude9c',
    [FULCRUM_TYPES.ELEVATOR]: '\ud83d\uded7',
    [FULCRUM_TYPES.ENTRANCE]: '\ud83d\udeaa',
    [FULCRUM_TYPES.HALL]: '\ud83c\udfdb\ufe0f',
    [FULCRUM_TYPES.RESTROOM]: '\ud83d\udebb',
    [FULCRUM_TYPES.KITCHEN]: '\ud83c\udf73',
    [FULCRUM_TYPES.RECEPTION]: '\ud83d\udcbc',
    [FULCRUM_TYPES.EMERGENCY_EXIT]: '\ud83d\udea8',
    [FULCRUM_TYPES.LANDMARK]: '\ud83d\udccd'
};
