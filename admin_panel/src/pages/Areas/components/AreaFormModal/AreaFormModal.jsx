import React from 'react';
import { ModalOverlay, Modal, ModalHeader, ModalContent } from '../../../../components/common/Modal';
import './AreaFormModal.css';

const AreaFormModal = ({
                           visible,
                           editingArea,
                           formData,
                           onClose,
                           onSave,
                           onFormDataChange
                       }) => {
    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(e);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <Modal size="md">
                <ModalHeader
                    title={editingArea ? 'Редактирование зоны' : 'Создание новой зоны'}
                    onClose={onClose}
                />

                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Название зоны *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => onFormDataChange('name', e.target.value)}
                                placeholder="Введите название зоны"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Описание</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => onFormDataChange('description', e.target.value)}
                                placeholder="Введите описание зоны"
                            />
                        </div>

                        {!editingArea && (
                            <div className="form-info">
                                💡 Зона будет автоматически привязана к вашему аккаунту
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Отмена
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingArea ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </ModalContent>
            </Modal>
        </ModalOverlay>
    );
};

export default AreaFormModal;