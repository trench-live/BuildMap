import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, fulcrumAPI } from '../../../../services/api';
import AreaCard from '../AreaCard/AreaCard';
import './AreasList.css';

const AreasList = ({
                       areas,
                       currentUser,
                       onEditArea,
                       onDeleteArea
                   }) => {
    const navigate = useNavigate();
    const [qrAvailability, setQrAvailability] = useState({});
    const [qrLoading, setQrLoading] = useState({});

    useEffect(() => {
        if (!areas?.length) {
            setQrAvailability({});
            setQrLoading({});
            return;
        }

        let isActive = true;
        const areaIds = areas.map((area) => area.id).filter((id) => Number.isFinite(id));
        const loadingState = Object.fromEntries(areaIds.map((areaId) => [areaId, true]));
        setQrLoading(loadingState);

        fulcrumAPI.getQrAvailability(areaIds).then((response) => {
            if (!isActive) {
                return;
            }

            const availableSet = new Set(response.data || []);
            const availabilityState = Object.fromEntries(
                areaIds.map((areaId) => [areaId, availableSet.has(areaId)])
            );
            const loadedState = Object.fromEntries(areaIds.map((areaId) => [areaId, false]));
            setQrAvailability(availabilityState);
            setQrLoading(loadedState);
        }).catch((error) => {
            if (!isActive) {
                return;
            }

            console.error('Failed to load QR availability by areas:', error);
            const fallbackAvailability = Object.fromEntries(areaIds.map((areaId) => [areaId, false]));
            const loadedState = Object.fromEntries(areaIds.map((areaId) => [areaId, false]));
            setQrAvailability(fallbackAvailability);
            setQrLoading(loadedState);
        });

        return () => {
            isActive = false;
        };
    }, [areas]);

    if (!areas || areas.length === 0) {
        return (
            <div className="areas-empty">
                У вас пока нет картографических зон. Создайте первую!
            </div>
        );
    }

    const handleOpenQrPdf = (area) => {
        if (!qrAvailability[area.id]) {
            return;
        }
        const url = `${API_BASE_URL}/api/fulcrum/area/${area.id}/qr.pdf?sizeMm=140`;
        window.open(url, '_blank', 'noopener');
    };

    const handleNavigateToFloors = (area) => {
        navigate(`/floors?area=${area.id}`);
    };

    return (
        <div className="areas-list">
            {areas.map((area) => {
                const isQrChecking = qrLoading[area.id] === true;
                const canPrintQr = qrAvailability[area.id] === true;
                const qrTooltip = isQrChecking
                    ? '\u041f\u0440\u043e\u0432\u0435\u0440\u044f\u0435\u043c \u0442\u043e\u0447\u043a\u0438 \u0441 QR-\u043a\u043e\u0434\u043e\u043c...'
                    : canPrintQr
                        ? 'QR PDF'
                        : '\u041d\u0435\u0442 \u0442\u043e\u0447\u0435\u043a \u0432 \u0437\u043e\u043d\u0435 \u0441 QR-\u043a\u043e\u0434\u043e\u043c, \u043d\u0435\u043b\u044c\u0437\u044f \u0441\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c';

                return (
                    <AreaCard
                        key={area.id}
                        area={area}
                        currentUser={currentUser}
                        onEdit={onEditArea}
                        onDelete={onDeleteArea}
                        onNavigate={() => handleNavigateToFloors(area)}
                        onPrintQr={() => handleOpenQrPdf(area)}
                        canPrintQr={canPrintQr}
                        isQrChecking={isQrChecking}
                        qrTooltip={qrTooltip}
                    />
                );
            })}
        </div>
    );
};

export default AreasList;
