import React from 'react';
import { formatAreaInfo } from '../../utils/areaHelpers';
import './AreaCard.css';

const AreaCard = ({
                      area,
                      currentUser,
                      onEdit,
                      onDelete,
                      onNavigate,
                      onPrintQr,
                      canPrintQr,
                      isQrChecking,
                      qrTooltip
                  }) => {
    return (
        <div className="area-card">
            <div className="area-card-content">
                <div className="area-info">
                    <h3 className="area-name">{area.name}</h3>
                    <p className="area-description">
                        {area.description || 'Описание отсутствует'}
                    </p>
                    <div className="area-meta">
                        {formatAreaInfo(area, currentUser)}
                    </div>
                </div>

                <div className="area-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => onEdit(area)}
                    >
                        ✏️ Редактировать
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => onDelete(area)}
                    >
                        🗑️ Удалить
                    </button>
                    <span className="area-action-tooltip" title={qrTooltip}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => onPrintQr(area)}
                            disabled={!canPrintQr || isQrChecking}
                        >
                            QR PDF
                        </button>
                    </span>
                    <button
                        className="btn btn-primary"
                        onClick={onNavigate}
                    >
                        → К этажам
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AreaCard;
