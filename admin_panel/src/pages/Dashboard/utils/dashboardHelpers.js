export const getRoleDisplay = (role) => {
    return role === 'ADMIN' ? 'Администратор' : 'Пользователь';
};

export const getRoleClassName = (role) => {
    return `role-${role?.toLowerCase()}`;
};