import React, { useEffect, useRef } from 'react';
import './TelegramWidget.css';

const TelegramWidget = () => {
    const widgetContainerRef = useRef(null);

    useEffect(() => {
        createTelegramWidget();
    }, []);

    const createTelegramWidget = () => {
        if (!widgetContainerRef.current) return;

        console.log('🛠 Creating Telegram widget...');
        widgetContainerRef.current.innerHTML = '';

        const widgetScript = document.createElement('script');
        widgetScript.async = true;
        widgetScript.src = 'https://telegram.org/js/telegram-widget.js?22';

        widgetScript.setAttribute('data-telegram-login', 'BuildMap_Bot');
        widgetScript.setAttribute('data-size', 'large');
        widgetScript.setAttribute('data-radius', '20');
        widgetScript.setAttribute('data-onauth', 'onTelegramAuth(user)');
        widgetScript.setAttribute('data-request-access', 'write');

        widgetScript.onload = () => console.log('✅ Telegram widget script loaded');
        widgetScript.onerror = (e) => console.error('❌ Telegram widget script failed:', e);

        widgetContainerRef.current.appendChild(widgetScript);
    };

    return (
        <div
            ref={widgetContainerRef}
            className="telegram-widget-container"
        >
            {/* Виджет будет вставлен сюда */}
        </div>
    );
};

export default TelegramWidget;