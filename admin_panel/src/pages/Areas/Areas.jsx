import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAreas } from './hooks/useAreas';
import { useAreaForm } from './hooks/useAreaForm';
import { DeleteModal } from '../../components/common/Modal';
import {
    AreaFormModal,
    AreasHeader,
    AreasList,
    ErrorState,
    LoadingState
} from './components';
import './Areas.css';

const Areas = () => {
    const { user } = useAuth();

    const {
        areas,
        loading,
        error,
        areaToDelete,
        deleteModalVisible,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        loadAreas
    } = useAreas();

    const {
        modalVisible,
        editingArea,
        formData,
        setFormData,
        handleSaveArea,
        handleEditArea,
        handleCreateArea,
        handleCloseModal
    } = useAreaForm(loadAreas);

    const handleFormDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="areas-page">
            <div className="card">
                <AreasHeader onCreateArea={handleCreateArea} />

                {loading && <LoadingState />}

                {error && (
                    <ErrorState
                        message={`Ошибка: ${error}`}
                        onRetry={loadAreas}
                    />
                )}

                {!loading && !error && (
                    <AreasList
                        areas={areas}
                        currentUser={user}
                        onEditArea={handleEditArea}
                        onDeleteArea={handleDeleteClick}
                    />
                )}
            </div>

            <AreaFormModal
                visible={modalVisible}
                editingArea={editingArea}
                formData={formData}
                onClose={handleCloseModal}
                onSave={handleSaveArea}
                onFormDataChange={handleFormDataChange}
            />

            <DeleteModal
                visible={deleteModalVisible}
                itemName={areaToDelete?.name}
                itemType="зону"
                warningText="Все этажи и точки навигации в этой зоне будут удалены."
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default Areas;