import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Areas from './pages/Areas/Areas';
import Floors from './pages/Floors/Floors';
import Users from './pages/Users/Users';
import Login from './pages/Login/Login';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return user?.role === 'ADMIN' ? children : <Navigate to="/" />;
};

const LayoutWithRoutes = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/areas" element={<Areas />} />
                <Route path="/floors" element={<Floors />} />
                <Route
                    path="/users"
                    element={(
                        <AdminRoute>
                            <Users />
                        </AdminRoute>
                    )}
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route
                            path="/login"
                            element={(
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            )}
                        />
                        <Route
                            path="/*"
                            element={(
                                <ProtectedRoute>
                                    <LayoutWithRoutes />
                                </ProtectedRoute>
                            )}
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
