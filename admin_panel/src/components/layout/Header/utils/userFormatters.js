export const getRoleDisplay = (role) => {
    const roleMap = {
        ADMIN: 'Администратор',
        USER: 'Пользователь'
    };
    return roleMap[role] || 'Пользователь';
};

export const formatTelegramId = (telegramId) => {
    if (!telegramId) return '';
    return telegramId.startsWith('test_') ? 'Тестовый аккаунт' : `ID: ${telegramId}`;
};

export const formatUserIdentity = (user) => {
    if (!user) return '';
    if (user.login) return `Логин: ${user.login}`;
    if (user.telegramId) return formatTelegramId(user.telegramId);
    return 'Нет логина';
};
