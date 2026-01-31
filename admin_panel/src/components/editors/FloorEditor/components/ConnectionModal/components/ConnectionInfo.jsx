import React from 'react';
import { FULCRUM_POINT_ICONS } from '../../FulcrumPoint/types/fulcrumTypes';

const ConnectionInfo = ({ fromFulcrum, toFulcrum }) => (
    <div className="connection-info">
        <div className="fulcrum-info">
            <span className="fulcrum-icon">
                {fromFulcrum ? FULCRUM_POINT_ICONS[fromFulcrum.type] : '\uD83D\uDCCD'}
            </span>
            <div className="fulcrum-details">
                <div className="fulcrum-name">{fromFulcrum?.name || '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e'}</div>
                <div className="fulcrum-type">{fromFulcrum?.type || ''}</div>
            </div>
        </div>

        <div className="connection-arrow">{'\u2192'}</div>

        <div className="fulcrum-info">
            <span className="fulcrum-icon">
                {toFulcrum ? FULCRUM_POINT_ICONS[toFulcrum.type] : '\uD83D\uDCCD'}
            </span>
            <div className="fulcrum-details">
                <div className="fulcrum-name">{toFulcrum?.name || '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e'}</div>
                <div className="fulcrum-type">{toFulcrum?.type || ''}</div>
            </div>
        </div>
    </div>
);

export default ConnectionInfo;
