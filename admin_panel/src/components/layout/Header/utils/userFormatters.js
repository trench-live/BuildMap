export const getRoleDisplay = (role) => {
    const roleMap = {
        'ADMIN': '👑 Администратор',
        'USER': '👤 Пользователь'
    };
    return roleMap[role] || '👤 Пользователь';
};

export const formatTelegramId = (telegramId) => {
    if (!telegramId) return '';
    return telegramId.startsWith('test_') ? 'Тестовый аккаунт' : `ID: ${telegramId}`;
};