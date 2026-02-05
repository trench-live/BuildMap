export const getRoleDisplay = (role) => {
    return role === 'ADMIN' ? 'Administrator' : 'User';
};

export const getRoleClassName = (role) => {
    return `role-${role?.toLowerCase()}`;
};

export const getAccountStatusDisplay = (user) => {
    if (!user) return 'Not specified';
    if (user.blocked) return 'Blocked';
    if (user.deleted) return 'Deleted';
    return 'Active';
};
