import React, { useEffect } from 'react';
import Modal from '../../../../common/Modal/components/Modal/Modal';
import ModalHeader from '../../../../common/Modal/components/ModalHeader/ModalHeader';
import ModalContent from '../../../../common/Modal/components/ModalContent/ModalContent';
import ModalActions from '../../../../common/Modal/components/ModalActions/ModalActions';
import Button from '../../../../common/Modal/components/Button/Button';
import { FULCRUM_POINT_ICONS } from '../FulcrumPoint/types/fulcrumTypes';
import { useConnectionForm } from './hooks/useConnectionForm';
import './ConnectionModal.css';

const ConnectionModal = ({
                             visible,
                             mode,
                             connection,
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

    // Инициализация формы при открытии модального окна
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && connection) {
                resetForm({
                    weight: connection.weight || 1.0
                });
            } else {
                resetForm();
            }
        }
    }, [visible, mode, connection, resetForm]);

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
                        {/* Информация о связываемых точках */}
                        <div className="connection-info">
                            <div className="fulcrum-info">
                                <span className="fulcrum-icon">
                                    {fromFulcrum ? FULCRUM_POINT_ICONS[fromFulcrum.type] : '📍'}
                                </span>
                                <div className="fulcrum-details">
                                    <div className="fulcrum-name">{fromFulcrum?.name || 'Неизвестно'}</div>
                                    <div className="fulcrum-type">{fromFulcrum?.type || ''}</div>
                                </div>
                            </div>

                            <div className="connection-arrow">→</div>

                            <div className="fulcrum-info">
                                <span className="fulcrum-icon">
                                    {toFulcrum ? FULCRUM_POINT_ICONS[toFulcrum.type] : '📍'}
                                </span>
                                <div className="fulcrum-details">
                                    <div className="fulcrum-name">{toFulcrum?.name || 'Неизвестно'}</div>
                                    <div className="fulcrum-type">{toFulcrum?.type || ''}</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="connection-weight">
                                Вес связи *
                                <span className="hint">(влияет на расчет маршрута)</span>
                            </label>
                            <input
                                id="connection-weight"
                                type="number"
                                value={formData.weight}
                                onChange={(e) => updateField('weight', e.target.value)}
                                min="0.1"
                                max="100"
                                step="0.1"
                                required
                                className={errors.weight ? 'error' : ''}
                            />
                            {errors.weight && <span className="error-message">{errors.weight}</span>}
                            <div className="weight-examples">
                                <small>
                                    Примеры: 1.0 - нормально, 2.0 - сложнее пройти, 0.5 - легче пройти
                                </small>
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