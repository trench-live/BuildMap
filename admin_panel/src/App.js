import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Areas from './pages/Areas/Areas';
import Floors from './pages/Floors/Floors';
import Login from './pages/Login/Login';
import './styles/global.css';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Загрузка...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Загрузка...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <LayoutWithRoutes />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

// Компонент для маршрутов внутри Layout
const LayoutWithRoutes = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/areas" element={<Areas />} />
                <Route path="/floors" element={<Floors />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};

export default App;