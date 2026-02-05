import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { userAPI } from '../../../services/api';

const buildUpdatePayload = (formData, fallbackUser) => ({
    name: formData.name.trim(),
    telegramId: formData.telegramId.trim(),
    role: formData.role || fallbackUser.role
});

export const useUsers = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingUserId, setPendingUserId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editVisible, setEditVisible] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        telegramId: '',
        role: 'USER'
    });

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const usersResponse = await userAPI.getAdminList();
            const usersData = (usersResponse.data || [])
                .sort((first, second) => second.id - first.id);
            setUsers(usersData);
        } catch (loadError) {
            setError(loadError.response?.data?.message || loadError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            telegramId: user.telegramId || '',
            role: user.role || 'USER'
        });
        setEditVisible(true);
    };

    const closeEdit = () => {
        setEditVisible(false);
        setEditingUser(null);
        setFormData({ name: '', telegramId: '', role: 'USER' });
    };

    const saveUser = async (event) => {
        event.preventDefault();
        if (!editingUser) return;

        const payload = buildUpdatePayload(formData, editingUser);
        if (!payload.name || !payload.telegramId) {
            alert('Name and Telegram ID are required');
            return;
        }

        try {
            await userAPI.update(editingUser.id, payload);
            closeEdit();
            await loadUsers();
        } catch (saveError) {
            alert(saveError.response?.data?.message || saveError.message);
        }
    };

    const openDelete = (user) => {
        setDeleteUser(user);
        setDeleteVisible(true);
    };

    const closeDelete = () => {
        setDeleteVisible(false);
        setDeleteUser(null);
    };

    const confirmDelete = async () => {
        if (!deleteUser) return;
        try {
            setPendingUserId(deleteUser.id);
            await userAPI.delete(deleteUser.id);
            closeDelete();
            await loadUsers();
        } catch (deleteError) {
            alert(deleteError.response?.data?.message || deleteError.message);
            closeDelete();
        } finally {
            setPendingUserId(null);
        }
    };

    const blockUser = async (userId) => {
        try {
            setPendingUserId(userId);
            await userAPI.block(userId);
            await loadUsers();
        } catch (blockError) {
            alert(blockError.response?.data?.message || blockError.message);
        } finally {
            setPendingUserId(null);
        }
    };

    const unblockUser = async (userId) => {
        try {
            setPendingUserId(userId);
            await userAPI.unblock(userId);
            await loadUsers();
        } catch (unblockError) {
            alert(unblockError.response?.data?.message || unblockError.message);
        } finally {
            setPendingUserId(null);
        }
    };

    const openUserAreas = (userId) => {
        navigate(`/areas?userId=${userId}`);
    };

    return {
        users,
        loading,
        error,
        pendingUserId,
        currentUserId: currentUser?.id || null,
        editingUser,
        editVisible,
        formData,
        setFormData,
        deleteUser,
        deleteVisible,
        openEdit,
        closeEdit,
        saveUser,
        openDelete,
        closeDelete,
        confirmDelete,
        blockUser,
        unblockUser,
        openUserAreas,
        reload: loadUsers
    };
};
