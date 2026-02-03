import { useState } from 'react';
import { floorAPI } from '../../../services/api';

const FLOOR_SUFFIX = '\u044d\u0442\u0430\u0436';
const getDefaultFloorName = (level) => `${level} ${FLOOR_SUFFIX}`;

export const useFloorForm = (expandedArea, onSuccess) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        level: 1,
        description: ''
    });

    const resetFormState = () => {
        setModalVisible(false);
        setEditingFloor(null);
        setFormData({ name: '', level: 1, description: '' });
    };

    const handleSaveFloor = async (event) => {
        event.preventDefault();
        const fallbackName = getDefaultFloorName(formData.level || 1);
        const resolvedName = formData.name.trim() || fallbackName;

        try {
            if (editingFloor) {
                await floorAPI.update(editingFloor.id, {
                    name: resolvedName,
                    level: formData.level,
                    description: formData.description
                });
            } else {
                await floorAPI.create({
                    ...formData,
                    name: resolvedName,
                    mappingAreaId: expandedArea
                });
            }

            resetFormState();
            onSuccess?.();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const openCreateModal = (_areaId, currentFloorsCount = 0) => {
        const nextLevel = currentFloorsCount + 1;
        setEditingFloor(null);
        setFormData({
            name: '',
            level: nextLevel,
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
        resetFormState();
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
