import React from 'react';
import { ModalOverlay, Modal, ModalHeader, ModalContent, ModalActions } from '../../../../components/common/Modal';
import { getFloorLabel } from '../../utils/floorLabels';
import './FloorFormModal.css';

const FloorFormModal = ({
                            visible,
                            editingFloor,
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

    const handleFieldChange = (field, value) => {
        onFormDataChange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <ModalOverlay onClick={onClose}>
            <Modal size="md">
                <ModalHeader
                    title={editingFloor ? 'Редактирование этажа' : 'Создание этажа'}
                    onClose={onClose}
                />

                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Название этажа *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="Например: Главный холл"
                            />
                        </div>

                        <div className="form-group">
                            <label>Уровень этажа</label>
                            <input
                                type="number"
                                value={formData.level}
                                onChange={(e) => handleFieldChange('level', parseInt(e.target.value) || 1)}
                                min="-5"
                                max="50"
                            />
                            <div className="form-hint">
                                {getFloorLabel(formData.level)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Описание</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                placeholder="Описание этажа..."
                            />
                        </div>

                        <ModalActions align="right">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Отмена
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingFloor ? 'Сохранить' : 'Создать'}
                            </button>
                        </ModalActions>
                    </form>
                </ModalContent>
            </Modal>
        </ModalOverlay>
    );
};

export default FloorFormModal;