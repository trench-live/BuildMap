import React from 'react';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';
import { FULCRUM_POINT_ICONS } from '../../FulcrumPoint/types/fulcrumTypes';
import { getFacingLabel, getTypeLabel } from '../utils/fulcrumLabels';

const FulcrumFormFields = ({ formData, errors, updateField }) => (
    <>
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

        <div className="form-group checkbox-group">
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={formData.hasQr}
                    onChange={(e) => updateField('hasQr', e.target.checked)}
                />
                <span className="checkbox-text">Has QR</span>
            </label>
        </div>

        {formData.hasQr && (
            <div className="form-group">
                <label htmlFor="fulcrum-facing">Direction</label>
                <select
                    id="fulcrum-facing"
                    value={formData.facingDirection}
                    onChange={(e) => updateField('facingDirection', e.target.value)}
                    className={errors.facingDirection ? 'error' : ''}
                >
                    {Object.values(FACING_DIRECTIONS).map(direction => (
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
    </>
);

export default FulcrumFormFields;
