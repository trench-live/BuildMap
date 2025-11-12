import React from 'react';
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
    const { stats, recentAreas, loading, error, loadDashboardData } = useDashboard();

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

    return (
        <div className="dashboard">
            <DashboardHeader userName={user?.name} />
            <StatsGrid stats={stats} user={user} />
            <RecentAreasSection areas={recentAreas} />
            <UserInfoSection user={user} />
        </div>
    );
};

export default Dashboard;