import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const useTelegramAuth = () => {
    const { login } = useAuth();
    const authProcessedRef = useRef(false);

    const handleTelegramAuth = useCallback(async (telegramUser) => {
        if (authProcessedRef.current) {
            console.log('⚠️ Auth already processed, skipping...');
            return;
        }

        authProcessedRef.current = true;

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
    }, [login]);

    useEffect(() => {
        console.log('🔧 Setting up Telegram auth handler...');

        // Глобальная функция для обработки авторизации Telegram
        window.onTelegramAuth = (userData) => {
            console.log('🎯 Telegram auth callback TRIGGERED!', userData);
            handleTelegramAuth(userData);
        };

        return () => {
            // Cleanup при размонтировании
            window.onTelegramAuth = null;
        };
    }, [handleTelegramAuth]);

    const checkUrlAuthData = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const telegramData = urlParams.get('tgAuth');

        if (telegramData && !authProcessedRef.current) {
            console.log('📨 Found Telegram data in URL parameters');
            try {
                const userData = JSON.parse(decodeURIComponent(telegramData));
                handleTelegramAuth(userData);
            } catch (error) {
                console.error('❌ Error parsing URL data:', error);
            }
        }
    }, [handleTelegramAuth]);

    useEffect(() => {
        checkUrlAuthData();
        const interval = setInterval(checkUrlAuthData, 1000);
        return () => clearInterval(interval);
    }, [checkUrlAuthData]);

    return {
        handleTelegramAuth
    };
};