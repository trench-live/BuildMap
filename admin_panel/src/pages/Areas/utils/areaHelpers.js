export const formatAreaInfo = (area, currentUser) => {
    const baseInfo = `📁 ID: ${area.id} • 👥 Пользователей: ${area.userIds?.length || 1}`;

    if (currentUser && area.userIds?.includes(currentUser.id)) {
        return `${baseInfo} • ✅ Ваша зона`;
    }

    return baseInfo;
};

export const validateAreaForm = (formData) => {
    if (!formData.name.trim()) {
        return 'Введите название зоны';
    }
    return null;
};