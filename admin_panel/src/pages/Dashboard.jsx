import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mappingAreaAPI, userAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAreas: 0,
        activeUsers: 0
    });
    const [recentAreas, setRecentAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Параллельная загрузка данных
            const [usersResponse, areasResponse] = await Promise.all([
                userAPI.getAll(false),
                mappingAreaAPI.getAll(false)
            ]);

            const users = usersResponse.data;
            const areas = areasResponse.data;

            // Фильтруем последние 3 области
            const recent = areas.slice(0, 3);

            setStats({
                totalUsers: users.length,
                totalAreas: areas.length,
                activeUsers: users.filter(u => !u.deleted).length
            });

            setRecentAreas(recent);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро';
        if (hour < 18) return 'Добрый день';
        return 'Добрый вечер';
    };

    const getRoleDisplay = (role) => {
        return role === 'ADMIN' ? 'Администратор' : 'Пользователь';
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-dashboard">
                    <div className="spinner"></div>
                    <p>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Ошибка загрузки</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={loadDashboardData}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>{getGreeting()}, {user?.name}!</h1>
                <p>Добро пожаловать в панель управления BuildMap</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    icon="👥"
                    value={stats.totalUsers}
                    label="Всего пользователей"
                />

                <StatCard
                    icon="🏢"
                    value={stats.totalAreas}
                    label="Рабочих областей"
                />

                <StatCard
                    icon="✅"
                    value={stats.activeUsers}
                    label="Активных пользователей"
                />

                <StatCard
                    icon={user?.role === 'ADMIN' ? '👑' : '👤'}
                    value={getRoleDisplay(user?.role)}
                    label="Ваша роль"
                />
            </div>

            <RecentAreasSection areas={recentAreas} />

            <UserInfoSection user={user} />
        </div>
    );
};

// Вынесенные компоненты для лучшей читаемости
const StatCard = ({ icon, value, label }) => (
    <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <h3>{value}</h3>
            <p>{label}</p>
        </div>
    </div>
);

const RecentAreasSection = ({ areas }) => (
    <section className="recent-section">
        <h2>Недавние рабочие области</h2>
        {areas.length > 0 ? (
            <div className="areas-list">
                {areas.map(area => (
                    <AreaCard key={area.id} area={area} />
                ))}
            </div>
        ) : (
            <EmptyAreasState />
        )}
    </section>
);

const AreaCard = ({ area }) => (
    <div className="area-card">
        <h4>{area.name}</h4>
        {area.description && (
            <p className="area-description">{area.description}</p>
        )}
        <div className="area-meta">
            <span>ID: {area.id}</span>
            {area.deleted && <span className="deleted-badge">Удалена</span>}
        </div>
    </div>
);

const EmptyAreasState = () => (
    <div className="empty-state">
        <p>Пока нет рабочих областей</p>
        <button
            className="primary-btn"
            onClick={() => window.location.href = '/areas'}
        >
            Создать первую область
        </button>
    </div>
);

const UserInfoSection = ({ user }) => (
    <section className="user-info-section">
        <h2>Ваша информация</h2>
        <div className="user-details-card">
            <DetailRow label="Имя:" value={user?.name} />
            <DetailRow label="Telegram ID:" value={user?.telegramId} />
            <DetailRow
                label="Роль:"
                value={user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                valueClassName={`role-${user?.role?.toLowerCase()}`}
            />
            <DetailRow
                label="Статус:"
                value={user?.deleted ? 'Деактивирован' : 'Активен'}
            />
        </div>
    </section>
);

const DetailRow = ({ label, value, valueClassName = '' }) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className={`detail-value ${valueClassName}`}>
      {value || 'Не указано'}
    </span>
    </div>
);

export default Dashboard;