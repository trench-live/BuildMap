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

const labels = {
    createTitle: '\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0442\u043e\u0447\u043a\u0438',
    editTitle: '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u0447\u043a\u0438',
    coordinates: '\u041a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u044b: ',
    delete: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
    cancel: '\u041e\u0442\u043c\u0435\u043d\u0430',
    save: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c',
    create: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c',
    saving: '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435...',
    openNavigation: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432 \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438'
};

const getNavigationBaseUrl = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }

    const rootHost = hostname
        .replace(/^admin\./, '')
        .replace(/^api\./, '')
        .replace(/^www\./, '');

    return `${protocol}//${rootHost}`;
};

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

    const navigationUrl = mode === 'edit' && fulcrum?.id
        ? `${getNavigationBaseUrl()}/navigation?fulcrum=${fulcrum.id}`
        : '';

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
                    floorId
                });
            } else {
                resetForm({
                    floorId
                });
            }
        }
    }, [visible, mode, fulcrum, position, floorId, resetForm]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const nextConnectionErrors = {};
        connectionRows.forEach((row) => {
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
            const preparedRows = connectionRows.map((row) => ({
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

    const handleOpenNavigation = () => {
        if (!navigationUrl) {
            return;
        }
        window.open(navigationUrl, '_blank', 'noopener,noreferrer');
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <Modal size="small" className="fulcrum-modal">
                <ModalHeader
                    title={mode === 'create' ? labels.createTitle : labels.editTitle}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit}>
                    <ModalContent>
                        {((mode === 'create' && position) || (mode === 'edit' && fulcrum)) && (
                            <div className="position-info">
                                <div className="position-info-main">
                                    <span>{labels.coordinates}</span>
                                    <strong>
                                        X: {formatCoord(formData.x)}, Y: {formatCoord(formData.y)}
                                    </strong>
                                </div>
                                {navigationUrl && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="small"
                                        onClick={handleOpenNavigation}
                                    >
                                        {labels.openNavigation}
                                    </Button>
                                )}
                            </div>
                        )}

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
                                {labels.delete}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {labels.cancel}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? labels.saving : (mode === 'create' ? labels.create : labels.save)}
                        </Button>
                    </ModalActions>
                </form>
            </Modal>
        </div>
    );
};

export default FulcrumModal;
