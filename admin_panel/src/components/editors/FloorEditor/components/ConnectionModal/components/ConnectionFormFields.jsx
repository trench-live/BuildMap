import React from 'react';

const ConnectionFormFields = ({ formData, errors, updateField }) => (
    <>
        <div className="form-group">
            <label htmlFor="connection-distance-meters">
                {'Длина (м) '}
                <span className="hint">{'(используется для подсказок маршрута)'}</span>
            </label>
            <input
                id="connection-distance-meters"
                type="number"
                value={formData.distanceMeters}
                onChange={(e) => updateField('distanceMeters', e.target.value)}
                min="0.1"
                max="10000"
                step="0.1"
                required
                className={errors.distanceMeters ? 'error' : ''}
            />
            {errors.distanceMeters && <span className="error-message">{errors.distanceMeters}</span>}
            <div className="distance-examples">
                <small>{'Например: 5, 12.5, 40'}</small>
            </div>
        </div>

        <div className="form-group checkbox-group">
            <label htmlFor="connection-bidirectional" className="checkbox-label">
                <input
                    id="connection-bidirectional"
                    type="checkbox"
                    checked={Boolean(formData.bidirectional)}
                    onChange={(e) => updateField('bidirectional', e.target.checked)}
                />
                <span className="checkbox-text">{' Двунаправленная связь'}</span>
            </label>
            <span className="hint">{'Автоматически создать/обновить обратную связь.'}</span>
        </div>

        <details className="form-group">
            <summary>Расширенные</summary>
            <label htmlFor="connection-difficulty-factor">
                {'Коэффициент сложности '}
                <span className="hint">{'(стоимость = длина × коэффициент)'}</span>
            </label>
            <input
                id="connection-difficulty-factor"
                type="number"
                value={formData.difficultyFactor}
                onChange={(e) => updateField('difficultyFactor', e.target.value)}
                min="1"
                max="100"
                step="0.1"
                required
                className={errors.difficultyFactor ? 'error' : ''}
            />
            {errors.difficultyFactor && <span className="error-message">{errors.difficultyFactor}</span>}
        </details>
    </>
);

export default ConnectionFormFields;
