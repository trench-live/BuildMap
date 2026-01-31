import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import LoginCard from './components/LoginCard/LoginCard';
import TelegramWidget from './components/TelegramWidget/TelegramWidget';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [devUserId, setDevUserId] = useState('1');
    const [devSecret, setDevSecret] = useState('dev');
    const [devLoading, setDevLoading] = useState(false);
    const [devError, setDevError] = useState(null);

    useTelegramAuth();

    
    const handleDevLogin = async (event) => {
        event.preventDefault();
        setDevLoading(true);
        setDevError(null);
        try {
            const payload = {
                userId: devUserId ? Number(devUserId) : null,
                secret: devSecret
            };
            const response = await authAPI.devLogin(payload);
            if (response?.data?.token && response?.data?.user) {
                login(response.data.token, response.data.user);
            } else {
                setDevError('Invalid response from dev login.');
            }
        } catch (error) {
            setDevError(error.response?.data?.message || error.message || 'Dev login failed.');
        } finally {
            setDevLoading(false);
        }
    };

useEffect(() => {
        console.log('🔐 Auth status changed - isAuthenticated:', isAuthenticated);
        if (isAuthenticated) {
            console.log('✅ User authenticated, redirecting to /');
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <LoginCard>
            <div className="login-content">
                <h2>Вход в систему</h2>
                <p>Для доступа к панели управления войдите через Telegram</p>

                <TelegramWidget />

                <form className="dev-login-form" onSubmit={handleDevLogin}>
                    <h3>Dev login</h3>
                    <label htmlFor="dev-user-id">User ID</label>
                    <input
                        id="dev-user-id"
                        type="number"
                        min="1"
                        value={devUserId}
                        onChange={(event) => setDevUserId(event.target.value)}
                    />
                    <label htmlFor="dev-secret">Secret</label>
                    <input
                        id="dev-secret"
                        type="password"
                        value={devSecret}
                        onChange={(event) => setDevSecret(event.target.value)}
                    />
                    {devError && <div className="dev-login-error">{devError}</div>}
                    <button type="submit" disabled={devLoading}>
                        {devLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </LoginCard>
    );
};

export default Login;