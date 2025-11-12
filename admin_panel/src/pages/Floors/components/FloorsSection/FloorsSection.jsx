import React from 'react';
import FloorItem from '../FloorItem/FloorItem';
import EmptyFloorsState from '../EmptyFloorsState/EmptyFloorsState';
import LoadingState from '../LoadingState/LoadingState';
import { sortFloorsByLevel } from '../../utils/floorHelpers';
import './FloorsSection.css';

const FloorsSection = ({
                           area,
                           floors,
                           loading,
                           onAddFloor,
                           onEditFloor,
                           onDeleteFloor,
                           onOpenEditor
                       }) => {
    if (loading) {
        return <LoadingState message="Загрузка этажей..." />;
    }

    if (!floors?.length) {
        return <EmptyFloorsState onAddFloor={onAddFloor} />;
    }

    const sortedFloors = sortFloorsByLevel(floors);

    return (
        <div className="floors-section">
            <div className="floors-header">
                <h4>Этажи зоны</h4>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onAddFloor}
                >
                    + Добавить этаж
                </button>
            </div>

            <div className="floors-list">
                {sortedFloors.map(floor => (
                    <FloorItem
                        key={floor.id}
                        floor={floor}
                        onEdit={onEditFloor}
                        onDelete={onDeleteFloor}
                        onOpenEditor={onOpenEditor}
                    />
                ))}
            </div>
        </div>
    );
};

export default FloorsSection;