import { useState, useEffect } from 'react';
import { mappingAreaAPI, userAPI } from '../../../services/api';

export const useDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAreas: 0,
        activeUsers: 0
    });
    const [recentAreas, setRecentAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [usersResponse, areasResponse] = await Promise.all([
                userAPI.getAll(false),
                mappingAreaAPI.getAll(false)
            ]);

            const users = usersResponse.data;
            const areas = areasResponse.data;

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

    useEffect(() => {
        loadDashboardData();
    }, []);

    return {
        stats,
        recentAreas,
        loading,
        error,
        loadDashboardData
    };
};