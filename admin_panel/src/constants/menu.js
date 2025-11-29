export const MENU_ITEMS = [
    {
        key: '/',
        icon: '📊',
        label: 'Дашборд',
        permission: 'VIEW_DASHBOARD'
    },
    {
        key: '/areas',
        icon: '🗺️',
        label: 'Мои зоны',
        permission: 'VIEW_AREAS'
    },
    {
        key: '/floors',
        icon: '🏢',
        label: 'Этажи',
        permission: 'VIEW_FLOORS'
    },
];

// Вспомогательные функции для работы с меню
export const getMenuItemByKey = (key) => {
    return MENU_ITEMS.find(item => item.key === key);
};

export const getMenuItemsByPermissions = (userPermissions = []) => {
    if (!userPermissions.length) return MENU_ITEMS;

    return MENU_ITEMS.filter(item =>
        !item.permission || userPermissions.includes(item.permission)
    );
};