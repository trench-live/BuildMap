import { useCallback, useEffect, useState } from 'react';
import { dashboardAPI, mappingAreaAPI, userAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

export const useDashboard = () => {
    const { user, logout } = useAuth();
    const [statItems, setStatItems] = useState([]);
    const [recentAreas, setRecentAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [canDeleteOwnAccount, setCanDeleteOwnAccount] = useState(true);
    const [deleteAccountHint, setDeleteAccountHint] = useState('');

    const loadDashboardData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const isAdmin = user.role === 'ADMIN';
            const [statsResponse, recentAreasResponse] = await Promise.all([
                isAdmin ? dashboardAPI.getAdminStats() : dashboardAPI.getMyStats(),
                isAdmin ? mappingAreaAPI.getAll(false) : mappingAreaAPI.getByUser(user.id, false),
            ]);

            const recent = recentAreasResponse.data || [];
            setRecentAreas(recent.slice(0, 5));

            if (isAdmin) {
                const stats = statsResponse.data;
                const canDelete = Number(stats.activeAdmins) > 1;
                setCanDeleteOwnAccount(canDelete);
                setDeleteAccountHint(canDelete ? '' : 'Cannot delete the last active admin account');
                setStatItems([
                    { icon: '\uD83D\uDC65', value: stats.activeUsers, label: 'Active users' },
                    { icon: '\u26D4', value: stats.blockedUsers, label: 'Blocked users' },
                    { icon: '\uD83D\uDDD1\uFE0F', value: stats.deletedUsers, label: 'Deleted users' },
                    { icon: '\uD83D\uDEE1\uFE0F', value: stats.activeAdmins, label: 'Active admins' },
                    { icon: '\uD83D\uDDFA\uFE0F', value: stats.activeAreas, label: 'Active areas' },
                    { icon: '\uD83C\uDFE2', value: stats.activeFloors, label: 'Floors' },
                    { icon: '\uD83D\uDCCD', value: stats.activeFulcrums, label: 'Fulcrums' },
                ]);
                return;
            }

            const stats = statsResponse.data;
            setCanDeleteOwnAccount(true);
            setDeleteAccountHint('');
            setStatItems([
                { icon: '\uD83D\uDDFA\uFE0F', value: stats.myActiveAreas, label: 'My active areas' },
                { icon: '\uD83C\uDFE2', value: stats.myActiveFloors, label: 'Floors in my areas' },
                { icon: '\uD83D\uDCCD', value: stats.myActiveFulcrums, label: 'Fulcrums in my areas' },
            ]);
        } catch (loadError) {
            console.error('Error loading dashboard data:', loadError);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.role]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const deleteOwnAccount = useCallback(async () => {
        if (!user?.id) return;

        try {
            setDeletingAccount(true);
            await userAPI.delete(user.id);
            await logout();
        } catch (deleteError) {
            const message = deleteError.response?.data?.message || deleteError.message;
            setError(message || 'Failed to delete account');
            throw deleteError;
        } finally {
            setDeletingAccount(false);
        }
    }, [user?.id, logout]);

    return {
        statItems,
        recentAreas,
        loading,
        error,
        deletingAccount,
        canDeleteOwnAccount,
        deleteAccountHint,
        loadDashboardData,
        deleteOwnAccount,
    };
};
