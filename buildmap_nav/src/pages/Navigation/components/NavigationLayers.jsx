import React from 'react';
import NavigationMap from '../../../components/NavigationMap/NavigationMap';

const NavigationLayers = ({
    floors,
    activeFloorId,
    activeMarkers,
    activeSegments,
    focusFulcrum,
    route,
    focusTargets,
    focusSegments,
    focusAnimate,
    stepsOpen,
    stepsPanelHeight
}) => (
    <div className="navigation-layers">
        {floors.map((floorItem) => {
            const isActive = floorItem.id === activeFloorId;
            return (
                <div
                    key={floorItem.id}
                    className={`navigation-layer${isActive ? ' is-active' : ''}`}
                >
                    {floorItem.svgPlan ? (
                        <NavigationMap
                            svgContent={floorItem.svgPlan}
                            fulcrums={isActive ? activeMarkers : []}
                            routeSegments={isActive ? activeSegments : []}
                            focusFulcrum={isActive ? focusFulcrum : null}
                            endFulcrumId={isActive ? route?.endFulcrumId : null}
                            focusTargets={isActive ? focusTargets : []}
                            focusSegments={isActive ? focusSegments : []}
                            focusAnimate={isActive ? focusAnimate : true}
                            focusYOffset={stepsOpen ? stepsPanelHeight : 0}
                        />
                    ) : (
                        <div className="navigation-layer-placeholder">
                            <h2>No map available</h2>
                            <p>This floor does not have an SVG plan yet.</p>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

export default NavigationLayers;
