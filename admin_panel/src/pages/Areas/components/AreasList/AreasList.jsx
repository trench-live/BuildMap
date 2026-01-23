import React from 'react';
import { API_BASE_URL } from '../../../../services/api';
import AreaCard from '../AreaCard/AreaCard';
import './AreasList.css';

const AreasList = ({
                       areas,
                       currentUser,
                       onEditArea,
                       onDeleteArea
                   }) => {
    if (!areas || areas.length === 0) {
        return (
            <div className="areas-empty">
                У вас пока нет картографических зон. Создайте первую!
            </div>
        );
    }

    const handleOpenQrPdf = (area) => {
        const url = `${API_BASE_URL}/api/fulcrum/area/${area.id}/qr.pdf?sizeMm=140`;
        window.open(url, '_blank', 'noopener');
    };

    const handleNavigateToFloors = (area) => {
        // TODO: Реализовать навигацию к этажам
        console.log('Navigate to floors for area:', area.id);
    };

    return (
        <div className="areas-list">
            {areas.map(area => (
                <AreaCard
                    key={area.id}
                    area={area}
                    currentUser={currentUser}
                    onEdit={onEditArea}
                    onDelete={onDeleteArea}
                    onNavigate={() => handleNavigateToFloors(area)}
                    onPrintQr={() => handleOpenQrPdf(area)}
                />
            ))}
        </div>
    );
};

export default AreasList;