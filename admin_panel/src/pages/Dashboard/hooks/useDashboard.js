import { useState, useEffect } from 'react';
import { mappingAreaAPI, userAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

export const useDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAreas: 0,
        activeUsers: 0
    });
    const [recentAreas, setRecentAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const isAdmin = user.role === 'ADMIN';
            const areasResponse = isAdmin
                ? await mappingAreaAPI.getAll(false)
                : await mappingAreaAPI.getByUser(user.id, false);
            const areas = areasResponse.data;
            const users = isAdmin ? (await userAPI.getAll(false)).data : [user];

            const recent = areas.slice(0, 3);

            setStats({
                totalUsers: users.length,
                totalAreas: areas.length,
                activeUsers: users.filter(u => !u.deleted).length || users.length
            });

            setRecentAreas(recent);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [user?.id, user?.role]);

    return {
        stats,
        recentAreas,
        loading,
        error,
        loadDashboardData
    };
};
