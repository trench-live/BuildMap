import React from 'react';

const InterfloorConnections = ({
    connectionRows,
    connectionErrors,
    connectionsLoading,
    connectionsError,
    updateConnectionRow,
    clearConnectionError
}) => (
    <div className="connections-section">
        <details>
            <summary>Inter-floor connections</summary>
            {connectionsLoading ? (
                <div className="connections-state">Loading connections...</div>
            ) : null}
            {connectionsError ? (
                <div className="connections-state error">
                    {connectionsError}
                </div>
            ) : null}
            {!connectionsLoading && !connectionsError ? (
                <div className="connections-table">
                    <div className="connections-header">
                        <span>Point</span>
                        <span>Floor</span>
                        <span>From current</span>
                        <span>Distance (m)</span>
                        <span>Factor</span>
                        <span>To current</span>
                        <span>Distance (m)</span>
                        <span>Factor</span>
                    </div>
                    {connectionRows.length === 0 ? (
                        <div className="connections-empty">
                            No eligible points on other floors.
                        </div>
                    ) : (
                        connectionRows.map(row => (
                            <div key={row.id} className="connections-row">
                                <span className="connections-name">{row.name}</span>
                                <span className="connections-floor">{row.floorName}</span>
                                <label className="connections-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={row.forwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'forwardEnabled', e.target.checked);
                                            clearConnectionError(row.id, 'forwardDistanceMeters');
                                            clearConnectionError(row.id, 'forwardDifficultyFactor');
                                        }}
                                    />
                                </label>
                                <div className="connections-metric">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={row.forwardDistanceMeters}
                                        disabled={!row.forwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'forwardDistanceMeters', e.target.value);
                                            clearConnectionError(row.id, 'forwardDistanceMeters');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.forwardDistanceMeters ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].forwardDistanceMeters}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="connections-metric">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={row.forwardDifficultyFactor}
                                        disabled={!row.forwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'forwardDifficultyFactor', e.target.value);
                                            clearConnectionError(row.id, 'forwardDifficultyFactor');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.forwardDifficultyFactor ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].forwardDifficultyFactor}
                                        </span>
                                    ) : null}
                                </div>
                                <label className="connections-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={row.backwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'backwardEnabled', e.target.checked);
                                            clearConnectionError(row.id, 'backwardDistanceMeters');
                                            clearConnectionError(row.id, 'backwardDifficultyFactor');
                                        }}
                                    />
                                </label>
                                <div className="connections-metric">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={row.backwardDistanceMeters}
                                        disabled={!row.backwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'backwardDistanceMeters', e.target.value);
                                            clearConnectionError(row.id, 'backwardDistanceMeters');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.backwardDistanceMeters ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].backwardDistanceMeters}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="connections-metric">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={row.backwardDifficultyFactor}
                                        disabled={!row.backwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'backwardDifficultyFactor', e.target.value);
                                            clearConnectionError(row.id, 'backwardDifficultyFactor');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.backwardDifficultyFactor ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].backwardDifficultyFactor}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : null}
        </details>
    </div>
);

export default InterfloorConnections;
