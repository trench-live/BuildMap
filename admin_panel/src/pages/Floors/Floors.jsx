import React, { useState } from 'react';
import { floorAPI } from '../../services/api';
import { useFloors } from './hooks/useFloors';
import { useFloorForm } from './hooks/useFloorForm';
import { DeleteModal } from '../../components/common/Modal';
import FloorEditor from '../../components/editors/FloorEditor';
import {
    PageHeader,
    ZoneItem,
    FloorsSection,
    FloorFormModal,
    LoadingState
} from './components';
import './Floors.css';

const Floors = () => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editorVisible, setEditorVisible] = useState(false);
    const [floorToDelete, setFloorToDelete] = useState(null);
    const [editingFloor, setEditingFloor] = useState(null);

    const {
        areas,
        areasLoading,
        expandedArea,
        floors,
        loadingFloors,
        floorsCount,
        toggleArea,
        loadFloorsForArea,
        loadFloorsCountForAllAreas
    } = useFloors();

    const {
        modalVisible,
        editingFloor: formEditingFloor,
        formData,
        setFormData,
        handleSaveFloor,
        openCreateModal,
        openEditModal,
        closeModal
    } = useFloorForm(expandedArea, () => {
        if (expandedArea) {
            loadFloorsForArea(expandedArea);
            loadFloorsCountForAllAreas();
        }
    });

    const handleDeleteClick = (floor) => {
        setFloorToDelete(floor);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!floorToDelete) return;

        try {
            await floorAPI.delete(floorToDelete.id); // ← Теперь floorAPI определен
            setDeleteModalVisible(false);
            setFloorToDelete(null);
            if (expandedArea) {
                await loadFloorsForArea(expandedArea);
                await loadFloorsCountForAllAreas();
            }
        } catch (error) {
            alert('Ошибка удаления: ' + error.message);
            setDeleteModalVisible(false);
            setFloorToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setFloorToDelete(null);
    };

    const handleOpenEditor = (floor) => {
        setEditingFloor(floor);
        setEditorVisible(true);
    };

    const handleCloseEditor = () => {
        setEditorVisible(false);
        setEditingFloor(null);
        if (expandedArea) {
            loadFloorsForArea(expandedArea);
        }
    };

    return (
        <div className="floors-page">
            <PageHeader
                title="🏢 Управление этажами"
                description="Создавайте и управляйте этажами для indoor навигации"
            />

            {areasLoading && <LoadingState message="Загрузка зон..." />}

            {areas?.map(area => (
                <ZoneItem
                    key={area.id}
                    area={area}
                    isExpanded={expandedArea === area.id}
                    floorsCount={floorsCount[area.id] ?? 0}
                    onToggle={() => toggleArea(area.id)}
                >
                    <FloorsSection
                        area={area}
                        floors={floors[area.id]}
                        loading={loadingFloors[area.id]}
                        onAddFloor={() => openCreateModal(area.id, floorsCount[area.id])}
                        onEditFloor={openEditModal}
                        onDeleteFloor={handleDeleteClick}
                        onOpenEditor={handleOpenEditor}
                    />
                </ZoneItem>
            ))}

            <FloorFormModal
                visible={modalVisible}
                editingFloor={formEditingFloor}
                formData={formData}
                onClose={closeModal}
                onSave={handleSaveFloor}
                onFormDataChange={setFormData}
            />

            <FloorEditor
                floor={editingFloor}
                visible={editorVisible}
                onClose={handleCloseEditor}
                onSave={handleCloseEditor}
            />

            <DeleteModal
                visible={deleteModalVisible}
                itemName={floorToDelete?.name}
                itemType="этаж"
                warningText="Все точки навигации на этом этаже будут удалены."
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default Floors;