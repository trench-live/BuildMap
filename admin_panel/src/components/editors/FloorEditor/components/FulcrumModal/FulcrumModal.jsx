import React, { useEffect } from 'react';
import Modal from '../../../../common/Modal/components/Modal/Modal';
import ModalHeader from '../../../../common/Modal/components/ModalHeader/ModalHeader';
import ModalContent from '../../../../common/Modal/components/ModalContent/ModalContent';
import ModalActions from '../../../../common/Modal/components/ModalActions/ModalActions';
import Button from '../../../../common/Modal/components/Button/Button';
import { FULCRUM_TYPES } from '../../types/editorTypes';
import { FULCRUM_POINT_ICONS } from '../FulcrumPoint/types/fulcrumTypes';
import { useFulcrumForm } from './hooks/useFulcrumForm';
import './FulcrumModal.css';

const FulcrumModal = ({
                          visible,
                          mode,
                          fulcrum,
                          position,
                          floorId,
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
        setCoordinates,
        setFloorId,
        validateForm,
        resetForm,
        getSubmitData
    } = useFulcrumForm();

    // Инициализация формы при открытии модального окна
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && fulcrum) {
                resetForm({
                    name: fulcrum.name || '',
                    description: fulcrum.description || '',
                    type: fulcrum.type || FULCRUM_TYPES.ROOM,
                    x: fulcrum.x || 0,
                    y: fulcrum.y || 0,
                    floorId: fulcrum.floorId || floorId
                });
            } else if (mode === 'create' && position && floorId) {
                resetForm({
                    x: position.x,
                    y: position.y,
                    floorId: floorId
                });
            } else {
                resetForm({
                    floorId: floorId
                });
            }
        }
    }, [visible, mode, fulcrum, position, floorId, resetForm]);

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
            <Modal size="small" className="fulcrum-modal">
                <ModalHeader
                    title={mode === 'create' ? 'Создание точки' : 'Редактирование точки'}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit}>
                    <ModalContent>
                        {(mode === 'create' && position) || (mode === 'edit' && fulcrum) ? (
                            <div className="position-info">
                                <span>Координаты: </span>
                                <strong>
                                    X: {formatCoord(formData.x)}, Y: {formatCoord(formData.y)}
                                </strong>
                            </div>
                        ) : null}

                        <div className="form-group">
                            <label htmlFor="fulcrum-name">Название *</label>
                            <input
                                id="fulcrum-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Введите название точки"
                                maxLength={50}
                                required
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulcrum-type">Тип точки</label>
                            <select
                                id="fulcrum-type"
                                value={formData.type}
                                onChange={(e) => updateField('type', e.target.value)}
                                className={errors.type ? 'error' : ''}
                            >
                                {Object.values(FULCRUM_TYPES).map(type => (
                                    <option key={type} value={type}>
                                        {FULCRUM_POINT_ICONS[type]} {getTypeLabel(type)}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <span className="error-message">{errors.type}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulcrum-description">Описание</label>
                            <textarea
                                id="fulcrum-description"
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Введите описание точки (необязательно)"
                                rows={3}
                                maxLength={200}
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && (
                                <span className="error-message">{errors.description}</span>
                            )}
                            <div className="character-count">
                                {formData.description.length}/200
                            </div>
                        </div>
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
                            disabled={isSubmitting || !formData.name.trim()}
                        >
                            {isSubmitting ? 'Сохранение...' : (mode === 'create' ? 'Создать' : 'Сохранить')}
                        </Button>
                    </ModalActions>
                </form>
            </Modal>
        </div>
    );
};

// Вспомогательная функция для получения читабельных названий типов
const getTypeLabel = (type) => {
    const labels = {
        [FULCRUM_TYPES.ROOM]: 'Комната',
        [FULCRUM_TYPES.CORRIDOR]: 'Коридор',
        [FULCRUM_TYPES.STAIRS]: 'Лестница',
        [FULCRUM_TYPES.ELEVATOR]: 'Лифт',
        [FULCRUM_TYPES.ENTRANCE]: 'Вход',
        [FULCRUM_TYPES.HALL]: 'Зал',
        [FULCRUM_TYPES.RESTROOM]: 'Туалет',
        [FULCRUM_TYPES.KITCHEN]: 'Кухня',
        [FULCRUM_TYPES.RECEPTION]: 'Ресепшен',
        [FULCRUM_TYPES.EMERGENCY_EXIT]: 'Аварийный выход',
        [FULCRUM_TYPES.LANDMARK]: 'Ориентир'
    };
    return labels[type] || type;
};

const formatCoord = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
    return Number(value).toFixed(3);
};

export default FulcrumModal;
