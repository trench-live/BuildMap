import React from 'react';

const FloorSwitcher = ({
    floors,
    activeFloorId,
    formatFloorLabel,
    onFloorSelect
}) => (
    <div className="floor-switcher" role="tablist" aria-label="Floors">
        <span className="floor-switcher-label">Floors</span>
        <div className="floor-switcher-list">
            {floors.map((floorItem) => {
                const isActive = floorItem.id === activeFloorId;
                return (
                    <button
                        key={floorItem.id}
                        type="button"
                        className={`floor-switcher-button${isActive ? ' is-active' : ''}`}
                        onClick={() => onFloorSelect(floorItem.id)}
                        aria-pressed={isActive}
                        title={floorItem.name || undefined}
                    >
                        {formatFloorLabel(floorItem)}
                    </button>
                );
            })}
        </div>
    </div>
);

export default FloorSwitcher;
