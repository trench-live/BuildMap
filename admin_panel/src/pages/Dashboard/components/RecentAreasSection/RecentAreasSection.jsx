import React from 'react';
import AreaCard from '../AreaCard/AreaCard';
import EmptyAreasState from '../EmptyAreasState/EmptyAreasState';
import './RecentAreasSection.css';

const RecentAreasSection = ({ areas, title = 'Recent work areas' }) => {
    return (
        <section className="recent-section">
            <h2>{title}</h2>
            {areas.length > 0 ? (
                <div className="areas-list">
                    {areas.map((area) => (
                        <AreaCard key={area.id} area={area} />
                    ))}
                </div>
            ) : (
                <EmptyAreasState />
            )}
        </section>
    );
};

export default RecentAreasSection;
