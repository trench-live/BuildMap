import { MENU_ITEMS } from '../../../../constants/menu';

export const getPageTitle = (currentPath) => {
    const currentItem = MENU_ITEMS.find(item => item.key === currentPath);
    return currentItem?.label || 'Дашборд';
};