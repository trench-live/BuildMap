import React from 'react';
import ModalOverlay from '../components/ModalOverlay/ModalOverlay';
import Modal from '../components/Modal/Modal';
import ModalHeader from '../components/ModalHeader/ModalHeader';
import ModalContent from '../components/ModalContent/ModalContent';
import ModalActions from '../components/ModalActions/ModalActions';
import './DeleteModal.css';

const DeleteModal = ({
    visible,
    title = 'Delete confirmation',
    itemName,
    itemType = 'item',
    warningText = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isProcessing = false,
    confirmDisabled = false,
    cancelDisabled = false,
    onConfirm,
    onCancel,
}) => {
    if (!visible) return null;

    const isConfirmDisabled = isProcessing || confirmDisabled;
    const isCancelDisabled = isProcessing || cancelDisabled;

    const handleCancel = () => {
        if (isCancelDisabled) return;
        onCancel();
    };

    const handleConfirm = () => {
        if (isConfirmDisabled) return;
        onConfirm();
    };

    return (
        <ModalOverlay onClick={handleCancel}>
            <Modal size="sm">
                <ModalHeader
                    title={title}
                    onClose={isCancelDisabled ? undefined : onCancel}
                />

                <ModalContent textAlign="center">
                    <div className="warning-icon">{'\u26A0\uFE0F'}</div>
                    <p>Are you sure you want to delete this {itemType}?</p>

                    {itemName && (
                        <p className="delete-target">"{itemName}"</p>
                    )}

                    <p className="delete-warning">{warningText}</p>

                    <ModalActions align="center">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={isCancelDisabled}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                        >
                            {confirmText}
                        </button>
                    </ModalActions>
                </ModalContent>
            </Modal>
        </ModalOverlay>
    );
};

export default DeleteModal;
