import React, { useEffect } from 'react';
import Modal from '../../../../common/Modal/components/Modal/Modal';
import ModalHeader from '../../../../common/Modal/components/ModalHeader/ModalHeader';
import ModalContent from '../../../../common/Modal/components/ModalContent/ModalContent';
import ModalActions from '../../../../common/Modal/components/ModalActions/ModalActions';
import Button from '../../../../common/Modal/components/Button/Button';
import { useConnectionForm } from './hooks/useConnectionForm';
import ConnectionInfo from './components/ConnectionInfo';
import ConnectionFormFields from './components/ConnectionFormFields';
import './ConnectionModal.css';

const ConnectionModal = ({
                             visible,
                             mode,
                             connection,
                             isBidirectional,
                             fromFulcrum,
                             toFulcrum,
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
    } = useConnectionForm();

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && connection) {
                resetForm({
                    distanceMeters: connection.distanceMeters || 1.0,
                    difficultyFactor: connection.difficultyFactor || 1.0,
                    bidirectional: Boolean(isBidirectional)
                });
            } else {
                resetForm({
                    distanceMeters: 1.0,
                    difficultyFactor: 1.0,
                    bidirectional: true
                });
            }
        }
    }, [visible, mode, connection, isBidirectional, resetForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(getSubmitData());
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <Modal size="small" className="connection-modal">
                <ModalHeader
                    title={mode === 'create' ? 'Создание связи' : 'Редактирование связи'}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit}>
                    <ModalContent>
                        <ConnectionInfo
                            fromFulcrum={fromFulcrum}
                            toFulcrum={toFulcrum}
                        />

                        <ConnectionFormFields
                            formData={formData}
                            errors={errors}
                            updateField={updateField}
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

export default ConnectionModal;
