import React from 'react';
import { ModalOverlay, Modal, ModalHeader, ModalContent, ModalActions } from '../../../../components/common/Modal';
import { getFloorLabel } from '../../utils/floorLabels';
import './FloorFormModal.css';

const FLOOR_SUFFIX = '\u044d\u0442\u0430\u0436';
const getDefaultFloorName = (level) => `${level} ${FLOOR_SUFFIX}`;
const normalizeLevel = (value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const labels = {
    editTitle: '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u0436\u0430',
    createTitle: '\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u0436\u0430',
    floorName: '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u0436\u0430 *',
    floorNamePlaceholder: '\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: N \u042d\u0442\u0430\u0436',
    defaultHintPrefix: '\u0415\u0441\u043b\u0438 \u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c, \u0431\u0443\u0434\u0435\u0442: ',
    floorLevel: '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u044d\u0442\u0430\u0436\u0430',
    description: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
    descriptionPlaceholder: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u0436\u0430...',
    cancel: '\u041e\u0442\u043c\u0435\u043d\u0430',
    save: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c',
    create: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c'
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
                                {labels.defaultHintPrefix}{getDefaultFloorName(normalizeLevel(formData.level, 1))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{labels.floorLevel}</label>
                            <input
                                type="number"
                                value={formData.level}
                                onChange={(event) => handleFieldChange('level', normalizeLevel(event.target.value, 1))}
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
