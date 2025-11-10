import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const widgetContainerRef = useRef(null);
    const authProcessedRef = useRef(false);

    useEffect(() => {
        console.log('🔐 Auth status changed - isAuthenticated:', isAuthenticated);
        if (isAuthenticated) {
            console.log('✅ User authenticated, redirecting to /');
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        console.log('🔧 Setting up Telegram auth handler...');

        // Глобальная функция для обработки авторизации Telegram
        window.onTelegramAuth = (userData) => {
            console.log('🎯 Telegram auth callback TRIGGERED!', userData);

            if (authProcessedRef.current) {
                console.log('⚠️ Auth already processed, skipping...');
                return;
            }

            authProcessedRef.current = true;
            handleTelegramAuth(userData);
        };

        // Проверяем, не пришли ли данные из другого окна
        const checkAuthData = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const telegramData = urlParams.get('tgAuth');

            if (telegramData && !authProcessedRef.current) {
                console.log('📨 Found Telegram data in URL parameters');
                try {
                    const userData = JSON.parse(decodeURIComponent(telegramData));
                    authProcessedRef.current = true;
                    handleTelegramAuth(userData);
                } catch (error) {
                    console.error('❌ Error parsing URL data:', error);
                }
            }
        };

        checkAuthData();
        createTelegramWidget();

        // Периодически проверяем URL на наличие данных
        const interval = setInterval(checkAuthData, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const createTelegramWidget = () => {
        if (!widgetContainerRef.current) return;

        console.log('🛠 Creating Telegram widget...');
        widgetContainerRef.current.innerHTML = '';

        const widgetScript = document.createElement('script');
        widgetScript.async = true;
        widgetScript.src = 'https://telegram.org/js/telegram-widget.js?22';

        // Убедимся что все атрибуты правильные
        widgetScript.setAttribute('data-telegram-login', 'BuildMap_Bot'); // Имя вашего бота
        widgetScript.setAttribute('data-size', 'large');
        widgetScript.setAttribute('data-radius', '20');
        widgetScript.setAttribute('data-onauth', 'onTelegramAuth(user)'); // Обратите внимание на (user)
        widgetScript.setAttribute('data-request-access', 'write');

        // Добавим атрибут для redirect (альтернативный способ)
        // widgetScript.setAttribute('data-auth-url', `${window.location.origin}/telegram-callback`);

        widgetScript.onload = () => console.log('✅ Telegram widget script loaded');
        widgetScript.onerror = (e) => console.error('❌ Telegram widget script failed:', e);

        widgetContainerRef.current.appendChild(widgetScript);
    };

    const handleTelegramAuth = async (telegramUser) => {
        try {
            console.log('🔄 Processing Telegram auth with data:', telegramUser);

            const API_URL = 'http://localhost:8080/api/auth/telegram';
            console.log('🌐 Sending to backend:', API_URL);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(telegramUser),
            });

            console.log('📨 Backend response status:', response.status);

            if (response.ok) {
                const authData = await response.json();
                console.log('✅ Backend auth successful:', authData);

                if (authData.token && authData.user) {
                    console.log('💾 Calling login function...');
                    login(authData.token, authData.user);

                    // Дополнительная проверка
                    setTimeout(() => {
                        console.log('🔍 Final check - isAuthenticated:', isAuthenticated);
                        console.log('🔍 Final check - token in localStorage:', !!localStorage.getItem('authToken'));
                    }, 500);
                } else {
                    console.error('❌ Missing data in response');
                    authProcessedRef.current = false;
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Backend auth failed:', errorText);
                alert('Ошибка авторизации: ' + errorText);
                authProcessedRef.current = false;
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('Ошибка соединения: ' + error.message);
            authProcessedRef.current = false;
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>BuildMap Admin</h1>
                    <p>Система управления indoor навигацией</p>
                </div>

                <div className="login-content">
                    <h2>Вход в систему</h2>
                    <p>Для доступа к панели управления войдите через Telegram</p>

                    <div
                        ref={widgetContainerRef}
                        className="telegram-widget-container"
                    >
                        {/* Виджет будет вставлен сюда */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;