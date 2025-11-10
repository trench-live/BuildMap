import React from 'react';
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
        <div className="modal-overlay">
            <div className="modal modal-sm">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div className="modal-content">
                    <div className="warning-icon">⚠️</div>
                    <p>Вы уверены, что хотите удалить {itemType}?</p>
                    {itemName && (
                        <p className="delete-target">"{itemName}"</p>
                    )}
                    <p className="delete-warning">{warningText}</p>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;