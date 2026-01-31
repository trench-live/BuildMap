import React from 'react';

const NavigationStepsPanel = ({
    selectedEndId,
    stepsOpen,
    stepsRef,
    route,
    selectedStepKey,
    onToggleSteps,
    onStepClick
}) => {
    if (!selectedEndId) {
        return null;
    }

    return (
        <div
            className={`navigation-steps${stepsOpen ? ' is-open' : ''}`}
            ref={stepsRef}
        >
            <button
                type="button"
                className="navigation-steps-toggle"
                onClick={onToggleSteps}
                aria-expanded={stepsOpen}
            >
                <span>Route hints</span>
                <span className="navigation-steps-chevron">{stepsOpen ? '▾' : '▴'}</span>
            </button>
            {stepsOpen && (
                <div className="navigation-steps-content">
                    {route?.steps?.length ? (
                        <ol className="navigation-steps-list">
                            {route.steps.map((step, index) => {
                                const baseKey = `${step.type}-${step.fromFulcrumId || 'x'}-${step.toFulcrumId || 'y'}`;
                                const stepKey = `${baseKey}-${index}`;
                                const isSelected = selectedStepKey === baseKey;
                                return (
                                    <li key={stepKey} className="navigation-step">
                                        <button
                                            type="button"
                                            className={`navigation-step-button${isSelected ? ' is-selected' : ''}`}
                                            onClick={() => onStepClick(step)}
                                        >
                                            {step.text}
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <div className="navigation-steps-empty">
                            No hints available yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NavigationStepsPanel;
