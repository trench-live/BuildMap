import React from 'react';
import { FACING_DIRECTIONS, FULCRUM_TYPES } from '../../../types/editorTypes';
import { FULCRUM_POINT_ICONS } from '../../FulcrumPoint/types/fulcrumTypes';
import { getDefaultFulcrumName } from '../hooks/useFulcrumForm';
import { getFacingLabel, getTypeLabel } from '../utils/fulcrumLabels';

const labels = {
    name: '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 *',
    namePlaceholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u0447\u043a\u0438',
    defaultHintPrefix: '\u0415\u0441\u043b\u0438 \u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c, \u0431\u0443\u0434\u0435\u0442: ',
    waypointHint: '\u0421\u043b\u0443\u0436\u0435\u0431\u043d\u0430\u044f \u0442\u043e\u0447\u043a\u0430 \u0434\u043b\u044f \u043f\u043e\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430. \u041e\u0431\u044b\u0447\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0434\u043b\u044f \u043f\u0440\u043e\u0445\u043e\u0434\u043e\u0432, \u043f\u043e\u0432\u043e\u0440\u043e\u0442\u043e\u0432 \u0438 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0445 \u0443\u0437\u043b\u043e\u0432.',
    type: '\u0422\u0438\u043f \u0442\u043e\u0447\u043a\u0438',
    description: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
    descriptionPlaceholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0442\u043e\u0447\u043a\u0438 (\u043d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e)',
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
            {formData.type === FULCRUM_TYPES.WAYPOINT ? (
                <div className="form-hint">
                    {labels.waypointHint}
                </div>
            ) : null}
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
