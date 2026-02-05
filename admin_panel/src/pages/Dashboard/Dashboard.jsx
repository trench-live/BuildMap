import React, { useState } from 'react';
import { DeleteModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from './hooks/useDashboard';
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import StatsGrid from './components/StatsGrid/StatsGrid';
import RecentAreasSection from './components/RecentAreasSection/RecentAreasSection';
import UserInfoSection from './components/UserInfoSection/UserInfoSection';
import LoadingState from './components/LoadingState/LoadingState';
import ErrorState from './components/ErrorState/ErrorState';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const {
        statItems,
        recentAreas,
        loading,
        error,
        deletingAccount,
        canDeleteOwnAccount,
        deleteAccountHint,
        loadDashboardData,
        deleteOwnAccount,
    } = useDashboard();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    if (loading) {
        return (
            <div className="dashboard">
                <LoadingState />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <ErrorState error={error} onRetry={loadDashboardData} />
            </div>
        );
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteOwnAccount();
            setDeleteModalVisible(false);
        } catch {
            setDeleteModalVisible(false);
        }
    };

    return (
        <div className="dashboard">
            <DashboardHeader userName={user?.name} />
            <StatsGrid items={statItems} />
            <RecentAreasSection
                areas={recentAreas}
                title={user?.role === 'ADMIN' ? 'Recent active areas' : 'My recent work areas'}
            />
            <UserInfoSection
                user={user}
                deletingAccount={deletingAccount}
                canDeleteAccount={canDeleteOwnAccount}
                deleteAccountHint={deleteAccountHint}
                onDeleteAccount={() => setDeleteModalVisible(true)}
            />
            <DeleteModal
                visible={deleteModalVisible}
                title="Delete account"
                itemType="account"
                itemName={user?.name}
                warningText="This action clears your account and related data. You can sign in again with Telegram to restore an empty account."
                confirmText={deletingAccount ? 'Deleting...' : 'Delete account'}
                cancelText="Cancel"
                isProcessing={deletingAccount}
                confirmDisabled={!canDeleteOwnAccount}
                cancelDisabled={deletingAccount}
                onConfirm={handleDeleteAccount}
                onCancel={() => setDeleteModalVisible(false)}
            />
        </div>
    );
};

export default Dashboard;
