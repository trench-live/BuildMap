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
                        <span>Weight</span>
                        <span>To current</span>
                        <span>Weight</span>
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
                                            clearConnectionError(row.id, 'forwardWeight');
                                        }}
                                    />
                                </label>
                                <div className="connections-weight">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={row.forwardWeight}
                                        disabled={!row.forwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'forwardWeight', e.target.value);
                                            clearConnectionError(row.id, 'forwardWeight');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.forwardWeight ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].forwardWeight}
                                        </span>
                                    ) : null}
                                </div>
                                <label className="connections-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={row.backwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'backwardEnabled', e.target.checked);
                                            clearConnectionError(row.id, 'backwardWeight');
                                        }}
                                    />
                                </label>
                                <div className="connections-weight">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={row.backwardWeight}
                                        disabled={!row.backwardEnabled}
                                        onChange={(e) => {
                                            updateConnectionRow(row.id, 'backwardWeight', e.target.value);
                                            clearConnectionError(row.id, 'backwardWeight');
                                        }}
                                    />
                                    {connectionErrors[row.id]?.backwardWeight ? (
                                        <span className="error-message">
                                            {connectionErrors[row.id].backwardWeight}
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
