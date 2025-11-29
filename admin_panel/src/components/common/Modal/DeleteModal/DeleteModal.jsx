import React from 'react';
import ModalOverlay from '../components/ModalOverlay/ModalOverlay';
import Modal from '../components/Modal/Modal';
import ModalHeader from '../components/ModalHeader/ModalHeader';
import ModalContent from '../components/ModalContent/ModalContent';
import ModalActions from '../components/ModalActions/ModalActions';
import './DeleteModal.css';

const DeleteModal = ({
                         visible,
                         title = "Подтверждение удаления",
                         itemName,
                         itemType = "элемент",
                         warningText = "Это действие нельзя будет отменить.",
                         confirmText = "Удалить",
                         cancelText = "Отмена",
                         onConfirm,
                         onCancel
                     }) => {
    if (!visible) return null;

    return (
        <ModalOverlay onClick={onCancel}>
            <Modal size="sm">
                <ModalHeader
                    title={title}
                    onClose={onCancel}
                />

                <ModalContent textAlign="center">
                    <div className="warning-icon">⚠️</div>
                    <p>Вы уверены, что хотите удалить {itemType}?</p>

                    {itemName && (
                        <p className="delete-target">"{itemName}"</p>
                    )}

                    <p className="delete-warning">{warningText}</p>

                    <ModalActions align="center">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </ModalActions>
                </ModalContent>
            </Modal>
        </ModalOverlay>
    );
};

export default DeleteModal;