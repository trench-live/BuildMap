import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../../../common/Modal/components/Modal/Modal';
import ModalHeader from '../../../../common/Modal/components/ModalHeader/ModalHeader';
import ModalContent from '../../../../common/Modal/components/ModalContent/ModalContent';
import ModalActions from '../../../../common/Modal/components/ModalActions/ModalActions';
import Button from '../../../../common/Modal/components/Button/Button';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../types/editorTypes';
import { FULCRUM_POINT_ICONS } from '../FulcrumPoint/types/fulcrumTypes';
import { useFulcrumForm } from './hooks/useFulcrumForm';
import { floorAPI, fulcrumAPI } from '../../../../../services/api';
import './FulcrumModal.css';

const FulcrumModal = ({
                          visible,
                          mode,
                          fulcrum,
                          position,
                          floorId,
                          mappingAreaId,
                          onSave,
                          onDelete,
                          onClose
                      }) => {
    const {
        formData,
        errors,
        isSubmitting,
        setIsSubmitting,
        updateField,
        setCoordinates,
        setFloorId,
        validateForm,
        resetForm,
        getSubmitData
    } = useFulcrumForm();

    const [connectionRows, setConnectionRows] = useState([]);
    const [connectionErrors, setConnectionErrors] = useState({});
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [connectionsError, setConnectionsError] = useState(null);

    const buildConnectionRows = useCallback((allFulcrums, floorNameById, currentFulcrumId, currentFloorId) => {
        const currentFulcrum = allFulcrums.find(item => item.id === currentFulcrumId);
        const outgoingConnections = new Map();
        const incomingConnections = new Map();

        if (currentFulcrum?.connections) {
            currentFulcrum.connections.forEach(connection => {
                outgoingConnections.set(connection.connectedFulcrumId, connection.weight);
            });
        }

        allFulcrums.forEach(item => {
            if (!item?.connections) return;
            const incoming = item.connections.find(connection => connection.connectedFulcrumId === currentFulcrumId);
            if (incoming) {
                incomingConnections.set(item.id, incoming.weight);
            }
        });

        return allFulcrums
            .filter(item => !item.deleted)
            .filter(item => item.id !== currentFulcrumId)
            .filter(item => item.floorId !== currentFloorId)
            .filter(item => item.type !== FULCRUM_TYPES.CORRIDOR)
            .map(item => ({
                id: item.id,
                name: item.name,
                floorId: item.floorId,
                floorName: floorNameById.get(item.floorId) || `Floor ${item.floorId}`,
                forwardEnabled: outgoingConnections.has(item.id),
                forwardWeight: outgoingConnections.get(item.id) ?? 1,
                backwardEnabled: incomingConnections.has(item.id),
                backwardWeight: incomingConnections.get(item.id) ?? 1
            }))
            .sort((a, b) => {
                if (a.floorName === b.floorName) {
                    return a.name.localeCompare(b.name);
                }
                return a.floorName.localeCompare(b.floorName);
            });
    }, []);

    const isValidWeight = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 1;
    };

    const normalizeWeight = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) return 1;
        return parsed;
    };

    // Инициализация формы при открытии модального окна
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && fulcrum) {
                resetForm({
                    name: fulcrum.name || '',
                    description: fulcrum.description || '',
                    type: fulcrum.type || FULCRUM_TYPES.ROOM,
                    facingDirection: fulcrum.facingDirection || FACING_DIRECTIONS.UP,
                    x: fulcrum.x || 0,
                    y: fulcrum.y || 0,
                    floorId: fulcrum.floorId || floorId
                });
            } else if (mode === 'create' && position && floorId) {
                resetForm({
                    x: position.x,
                    y: position.y,
                    floorId: floorId
                });
            } else {
                resetForm({
                    floorId: floorId
                });
            }
        }
    }, [visible, mode, fulcrum, position, floorId, resetForm]);

    useEffect(() => {
        if (!visible || !mappingAreaId) {
            setConnectionRows([]);
            setConnectionErrors({});
            setConnectionsError(null);
            return;
        }

        let isMounted = true;
        const loadConnections = async () => {
            setConnectionsLoading(true);
            setConnectionsError(null);

            try {
                const [floorsResponse, fulcrumsResponse] = await Promise.all([
                    floorAPI.getByArea(mappingAreaId, false),
                    fulcrumAPI.getByArea(mappingAreaId, false)
                ]);

                if (!isMounted) return;

                const floorNameById = new Map();
                floorsResponse.data.forEach(item => {
                    floorNameById.set(item.id, item.name);
                });

                const rows = buildConnectionRows(
                    fulcrumsResponse.data,
                    floorNameById,
                    fulcrum?.id ?? null,
                    floorId ?? null
                );

                setConnectionRows(rows);
                setConnectionErrors({});
            } catch (error) {
                if (!isMounted) return;
                setConnectionsError(error.response?.data?.message || error.message || 'Failed to load connections.');
            } finally {
                if (isMounted) {
                    setConnectionsLoading(false);
                }
            }
        };

        loadConnections();

        return () => {
            isMounted = false;
        };
    }, [visible, mappingAreaId, fulcrum?.id, floorId, buildConnectionRows]);

    const updateConnectionRow = (rowId, field, value) => {
        setConnectionRows(prev => prev.map(row => {
            if (row.id !== rowId) return row;
            return {
                ...row,
                [field]: value
            };
        }));
    };

    const clearConnectionError = (rowId, field) => {
        setConnectionErrors(prev => {
            if (!prev[rowId]) return prev;
            const next = { ...prev[rowId] };
            delete next[field];
            const rest = { ...prev };
            if (Object.keys(next).length === 0) {
                delete rest[rowId];
            } else {
                rest[rowId] = next;
            }
            return rest;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const nextConnectionErrors = {};
        connectionRows.forEach(row => {
            if (row.forwardEnabled && !isValidWeight(row.forwardWeight)) {
                nextConnectionErrors[row.id] = {
                    ...(nextConnectionErrors[row.id] || {}),
                    forwardWeight: 'Weight must be at least 1.'
                };
            }
            if (row.backwardEnabled && !isValidWeight(row.backwardWeight)) {
                nextConnectionErrors[row.id] = {
                    ...(nextConnectionErrors[row.id] || {}),
                    backwardWeight: 'Weight must be at least 1.'
                };
            }
        });

        if (Object.keys(nextConnectionErrors).length > 0) {
            setConnectionErrors(nextConnectionErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const preparedRows = connectionRows.map(row => ({
                ...row,
                forwardWeight: normalizeWeight(row.forwardWeight),
                backwardWeight: normalizeWeight(row.backwardWeight)
            }));
            await onSave({
                fulcrumData: getSubmitData(),
                connectionRows: preparedRows
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <Modal size="small" className="fulcrum-modal">
                <ModalHeader
                    title={mode === 'create' ? 'Создание точки' : 'Редактирование точки'}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit}>
                    <ModalContent>
                        {(mode === 'create' && position) || (mode === 'edit' && fulcrum) ? (
                            <div className="position-info">
                                <span>Координаты: </span>
                                <strong>
                                    X: {formatCoord(formData.x)}, Y: {formatCoord(formData.y)}
                                </strong>
                            </div>
                        ) : null}

                        <div className="form-group">
                            <label htmlFor="fulcrum-name">Название *</label>
                            <input
                                id="fulcrum-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Введите название точки"
                                maxLength={50}
                                required
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulcrum-type">Тип точки</label>
                            <select
                                id="fulcrum-type"
                                value={formData.type}
                                onChange={(e) => updateField('type', e.target.value)}
                                className={errors.type ? 'error' : ''}
                            >
                                {Object.values(FULCRUM_TYPES).map(type => (
                                    <option key={type} value={type}>
                                        {FULCRUM_POINT_ICONS[type]} {getTypeLabel(type)}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <span className="error-message">{errors.type}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulcrum-facing">Direction</label>
                            <select
                                id="fulcrum-facing"
                                value={formData.facingDirection}
                                onChange={(e) => updateField('facingDirection', e.target.value)}
                                className={errors.facingDirection ? 'error' : ''}
                            >
                                {Object.values(FACING_DIRECTIONS).map(direction => (
                                    <option key={direction} value={direction}>
                                        {getFacingLabel(direction)}
                                    </option>
                                ))}
                            </select>
                            {errors.facingDirection && (
                                <span className="error-message">{errors.facingDirection}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulcrum-description">Описание</label>
                            <textarea
                                id="fulcrum-description"
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Введите описание точки (необязательно)"
                                rows={3}
                                maxLength={200}
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && (
                                <span className="error-message">{errors.description}</span>
                            )}
                            <div className="character-count">
                                {formData.description.length}/200
                            </div>
                        </div>

                        <div className="connections-section">
                            <details open>
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
                    </ModalContent>

                    <ModalActions align="right">
                        {mode === 'edit' && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={onDelete}
                                disabled={isSubmitting}
                            >
                                Удалить
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !formData.name.trim()}
                        >
                            {isSubmitting ? 'Сохранение...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
                        </Button>
                    </ModalActions>
                </form>
            </Modal>
        </div>
    );
};

// Вспомогательная функция для получения читабельных названий типов
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

const formatCoord = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
    return Number(value).toFixed(3);
};

export default FulcrumModal;
