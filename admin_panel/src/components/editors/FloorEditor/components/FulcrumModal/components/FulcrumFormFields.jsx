import React from 'react';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';
import { FULCRUM_POINT_ICONS } from '../../FulcrumPoint/types/fulcrumTypes';
import { getDefaultFulcrumName } from '../hooks/useFulcrumForm';
import { getFacingLabel, getTypeLabel } from '../utils/fulcrumLabels';

const labels = {
    name: 'Название *',
    namePlaceholder: 'Введите название точки',
    defaultHintPrefix: 'Если оставить пустым, будет: ',
    type: 'Тип точки',
    description: 'Описание',
    descriptionPlaceholder: 'Введите описание точки (необязательно)',
    hasQr: 'Has QR',
    direction: 'Direction'
};

const FulcrumFormFields = ({ formData, errors, updateField }) => (
    <>
        <div className="form-group">
            <label htmlFor="fulcrum-name">{labels.name}</label>
            <input
                id="fulcrum-name"
                type="text"
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder={labels.namePlaceholder}
                maxLength={50}
                className={errors.name ? 'error' : ''}
            />
            <div className="form-hint">
                {labels.defaultHintPrefix}{getDefaultFulcrumName(formData.type)}
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
            <label htmlFor="fulcrum-type">{labels.type}</label>
            <select
                id="fulcrum-type"
                value={formData.type}
                onChange={(event) => updateField('type', event.target.value)}
                className={errors.type ? 'error' : ''}
            >
                {Object.values(FULCRUM_TYPES).map((type) => (
                    <option key={type} value={type}>
                        {FULCRUM_POINT_ICONS[type]} {getTypeLabel(type)}
                    </option>
                ))}
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
        </div>

        <div className="form-group checkbox-group">
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={formData.hasQr}
                    onChange={(event) => updateField('hasQr', event.target.checked)}
                />
                <span className="checkbox-text">{labels.hasQr}</span>
            </label>
        </div>

        {formData.hasQr && (
            <div className="form-group">
                <label htmlFor="fulcrum-facing">{labels.direction}</label>
                <select
                    id="fulcrum-facing"
                    value={formData.facingDirection}
                    onChange={(event) => updateField('facingDirection', event.target.value)}
                    className={errors.facingDirection ? 'error' : ''}
                >
                    {Object.values(FACING_DIRECTIONS).map((direction) => (
                        <option key={direction} value={direction}>
                            {getFacingLabel(direction)}
                        </option>
                    ))}
                </select>
                {errors.facingDirection && (
                    <span className="error-message">{errors.facingDirection}</span>
                )}
            </div>
        )}

        <div className="form-group">
            <label htmlFor="fulcrum-description">{labels.description}</label>
            <textarea
                id="fulcrum-description"
                value={formData.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder={labels.descriptionPlaceholder}
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
    </>
);

export default FulcrumFormFields;
