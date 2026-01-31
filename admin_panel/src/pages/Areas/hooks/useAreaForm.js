import { useState } from 'react';
import { mappingAreaAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

export const useAreaForm = (onSuccess) => {
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleSaveArea = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Введите название зоны');
            return;
        }

        try {
            if (editingArea) {
                await mappingAreaAPI.update(editingArea.id, {
                    name: formData.name,
                    description: formData.description
                });
            } else {
                await mappingAreaAPI.create({
                    name: formData.name,
                    description: formData.description,
                    userIds: [user.id]
                });
            }

            setModalVisible(false);
            setEditingArea(null);
            setFormData({ name: '', description: '' });
            onSuccess?.();

        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditArea = (area) => {
        setEditingArea(area);
        setFormData({
            name: area.name,
            description: area.description || ''
        });
        setModalVisible(true);
    };

    const handleCreateArea = () => {
        setEditingArea(null);
        setFormData({ name: '', description: '' });
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingArea(null);
        setFormData({ name: '', description: '' });
    };

    return {
        modalVisible,
        editingArea,
        formData,
        setFormData,
        handleSaveArea,
        handleEditArea,
        handleCreateArea,
        handleCloseModal
    };
};