import React from 'react';

const ConnectionFormFields = ({ formData, errors, updateField }) => (
    <>
        <div className="form-group">
            <label htmlFor="connection-weight">
                {'\u0412\u0435\u0441 \u0441\u0432\u044f\u0437\u0438 *'}
                <span className="hint">{'(\u0432\u043b\u0438\u044f\u0435\u0442 \u043d\u0430 \u0440\u0430\u0441\u0447\u0435\u0442 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430)'}</span>
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
                    {'\u041f\u0440\u0438\u043c\u0435\u0440\u044b: 1.0 - \u043d\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e, 2.0 - \u0441\u043b\u043e\u0436\u043d\u0435\u0435 \u043f\u0440\u043e\u0439\u0442\u0438, 0.5 - \u043b\u0435\u0433\u0447\u0435 \u043f\u0440\u043e\u0439\u0442\u0438'}
                </small>
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
                <span className="checkbox-text">{' \u0414\u0432\u0443\u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c'}</span>
            </label>
            <span className="hint">{'\u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0441\u043e\u0437\u0434\u0430\u0442\u044c/\u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043e\u0431\u0440\u0430\u0442\u043d\u0443\u044e \u0441\u0432\u044f\u0437\u044c.'}</span>
        </div>
    </>
);

export default ConnectionFormFields;
