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
                    weight: connection.weight || 1.0,
                    bidirectional: Boolean(isBidirectional)
                });
            } else {
                resetForm({
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
                    title={mode === 'create' ? '\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0441\u0432\u044f\u0437\u0438' : '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0441\u0432\u044f\u0437\u0438'}
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
                                {'\u0423\u0434\u0430\u043b\u0438\u0442\u044c'}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {'\u041e\u0442\u043c\u0435\u043d\u0430'}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435...' : (mode === 'create' ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c' : '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c')}
                        </Button>
                    </ModalActions>
                </form>
            </Modal>
        </div>
    );
};

export default ConnectionModal;
