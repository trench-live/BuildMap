import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import LoginCard from './components/LoginCard/LoginCard';
import TelegramWidget from './components/TelegramWidget/TelegramWidget';
import './Login.css';

const Login = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useTelegramAuth();

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
            </div>
        </LoginCard>
    );
};

export default Login;