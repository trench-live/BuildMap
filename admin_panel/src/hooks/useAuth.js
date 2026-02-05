import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            await logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = (token, userData) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
