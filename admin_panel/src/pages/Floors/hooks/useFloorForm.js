import { useState } from 'react';
import { floorAPI } from '../../../services/api';

export const useFloorForm = (expandedArea, onSuccess) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        level: 1,
        description: ''
    });

    const handleSaveFloor = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Введите название этажа');
            return;
        }

        try {
            if (editingFloor) {
                await floorAPI.update(editingFloor.id, {
                    name: formData.name,
                    level: formData.level,
                    description: formData.description
                });
            } else {
                await floorAPI.create({
                    ...formData,
                    mappingAreaId: expandedArea
                });
            }

            setModalVisible(false);
            setEditingFloor(null);
            setFormData({ name: '', level: 1, description: '' });
            onSuccess?.();
        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    const openCreateModal = (areaId, currentFloorsCount = 0) => {
        setEditingFloor(null);
        setFormData({
            name: '',
            level: currentFloorsCount + 1,
            description: ''
        });
        setModalVisible(true);
    };

    const openEditModal = (floor) => {
        setEditingFloor(floor);
        setFormData({
            name: floor.name,
            level: floor.level || 1,
            description: floor.description || ''
        });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingFloor(null);
        setFormData({ name: '', level: 1, description: '' });
    };

    return {
        modalVisible,
        editingFloor,
        formData,
        setFormData,
        handleSaveFloor,
        openCreateModal,
        openEditModal,
        closeModal
    };
};