import React from 'react';
import ZoneHeader from '../ZoneHeader/ZoneHeader';
import ZoneContent from '../ZoneContent/ZoneContent';
import './ZoneItem.css';

const ZoneItem = ({
                      area,
                      isExpanded,
                      floorsCount,
                      onToggle,
                      children
                  }) => {
    return (
        <div className="zone-item">
            <ZoneHeader
                area={area}
                isExpanded={isExpanded}
                floorsCount={floorsCount}
                onToggle={onToggle}
            />
            {isExpanded && (
                <ZoneContent>
                    {children}
                </ZoneContent>
            )}
        </div>
    );
};

export default ZoneItem;