import React from 'react';
import DetailRow from '../DetailRow/DetailRow';
import { getRoleDisplay, getRoleClassName } from '../../utils/dashboardHelpers';
import './UserInfoSection.css';

const UserInfoSection = ({ user }) => {
    return (
        <section className="user-info-section">
            <h2>Ваша информация</h2>
            <div className="user-details-card">
                <DetailRow label="Имя:" value={user?.name} />
                <DetailRow label="Telegram ID:" value={user?.telegramId} />
                <DetailRow
                    label="Роль:"
                    value={getRoleDisplay(user?.role)}
                    valueClassName={getRoleClassName(user?.role)}
                />
                <DetailRow
                    label="Статус:"
                    value={user?.deleted ? 'Деактивирован' : 'Активен'}
                />
            </div>
        </section>
    );
};

export default UserInfoSection;