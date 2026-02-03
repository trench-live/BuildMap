import React, { useEffect } from 'react';
import Modal from '../../../../common/Modal/components/Modal/Modal';
import ModalHeader from '../../../../common/Modal/components/ModalHeader/ModalHeader';
import ModalContent from '../../../../common/Modal/components/ModalContent/ModalContent';
import ModalActions from '../../../../common/Modal/components/ModalActions/ModalActions';
import Button from '../../../../common/Modal/components/Button/Button';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../types/editorTypes';
import { useFulcrumForm } from './hooks/useFulcrumForm';
import useInterfloorConnections from './hooks/useInterfloorConnections';
import FulcrumFormFields from './components/FulcrumFormFields';
import InterfloorConnections from './components/InterfloorConnections';
import { formatCoord } from './utils/formatters';
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
        validateForm,
        resetForm,
        getSubmitData
    } = useFulcrumForm();

    const {
        connectionRows,
        connectionErrors,
        connectionsLoading,
        connectionsError,
        updateConnectionRow,
        clearConnectionError,
        setConnectionErrors,
        isValidWeight,
        normalizeWeight
    } = useInterfloorConnections({
        visible,
        mappingAreaId,
        fulcrumId: fulcrum?.id ?? null,
        floorId
    });

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && fulcrum) {
                resetForm({
                    name: fulcrum.name || '',
                    description: fulcrum.description || '',
                    type: fulcrum.type || FULCRUM_TYPES.ROOM,
                    facingDirection: fulcrum.facingDirection || FACING_DIRECTIONS.UP,
                    hasQr: Boolean(fulcrum.hasQr),
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

                        <FulcrumFormFields
                            formData={formData}
                            errors={errors}
                            updateField={updateField}
                        />

                        <InterfloorConnections
                            connectionRows={connectionRows}
                            connectionErrors={connectionErrors}
                            connectionsLoading={connectionsLoading}
                            connectionsError={connectionsError}
                            updateConnectionRow={updateConnectionRow}
                            clearConnectionError={clearConnectionError}
                        />

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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
                        </Button>
                    </ModalActions>
                </form>
            </Modal>
        </div>
    );
};

export default FulcrumModal;
