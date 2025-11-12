import React from 'react';
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
                />
            ))}
        </div>
    );
};

export default AreasList;