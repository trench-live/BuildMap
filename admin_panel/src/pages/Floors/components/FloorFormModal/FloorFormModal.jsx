import React from 'react';
import { ModalOverlay, Modal, ModalHeader, ModalContent, ModalActions } from '../../../../components/common/Modal';
import { getFloorLabel } from '../../utils/floorLabels';
import './FloorFormModal.css';

const FLOOR_SUFFIX = 'этаж';
const getDefaultFloorName = (level) => `${level} ${FLOOR_SUFFIX}`;

const labels = {
    editTitle: 'Редактирование этажа',
    createTitle: 'Создание этажа',
    floorName: 'Название этажа *',
    floorNamePlaceholder: 'Например: N Этаж',
    defaultHintPrefix: 'Если оставить пустым, будет: ',
    floorLevel: 'Уровень этажа',
    description: 'Описание',
    descriptionPlaceholder: 'Описание этажа...',
    cancel: 'Отмена',
    save: 'Сохранить',
    create: 'Создать'
};

const FloorFormModal = ({
    visible,
    editingFloor,
    formData,
    onClose,
    onSave,
    onFormDataChange
}) => {
    if (!visible) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(event);
    };

    const handleFieldChange = (field, value) => {
        onFormDataChange((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <ModalOverlay onClick={onClose}>
            <Modal size="md">
                <ModalHeader
                    title={editingFloor ? labels.editTitle : labels.createTitle}
                    onClose={onClose}
                />

                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{labels.floorName}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(event) => handleFieldChange('name', event.target.value)}
                                placeholder={labels.floorNamePlaceholder}
                            />
                            <div className="form-hint">
                                {labels.defaultHintPrefix}{getDefaultFloorName(formData.level || 1)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{labels.floorLevel}</label>
                            <input
                                type="number"
                                value={formData.level}
                                onChange={(event) => handleFieldChange('level', parseInt(event.target.value, 10) || 1)}
                                min="-5"
                                max="50"
                            />
                            <div className="form-hint">
                                {getFloorLabel(formData.level)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{labels.description}</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(event) => handleFieldChange('description', event.target.value)}
                                placeholder={labels.descriptionPlaceholder}
                            />
                        </div>

                        <ModalActions align="right">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                {labels.cancel}
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingFloor ? labels.save : labels.create}
                            </button>
                        </ModalActions>
                    </form>
                </ModalContent>
            </Modal>
        </ModalOverlay>
    );
};

export default FloorFormModal;
