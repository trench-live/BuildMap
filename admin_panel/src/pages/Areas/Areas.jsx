import React from 'react';
import { useSearchParams } from 'react-router-dom';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const targetUserIdParam = searchParams.get('userId');
    const targetUserId = targetUserIdParam ? Number(targetUserIdParam) : null;
    const isValidTargetUserId = Number.isFinite(targetUserId) && targetUserId > 0;

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
    } = useAreas(user?.role === 'ADMIN' && isValidTargetUserId ? targetUserId : null);

    const {
        modalVisible,
        editingArea,
        formData,
        setFormData,
        handleSaveArea,
        handleEditArea,
        handleCreateArea,
        handleCloseModal
    } = useAreaForm(
        loadAreas,
        user?.role === 'ADMIN' && isValidTargetUserId ? targetUserId : null
    );

    const handleFormDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="areas-page">
            <div className="card">
                {user?.role === 'ADMIN' && isValidTargetUserId && (
                    <div className="areas-user-filter">
                        <span>Viewing areas for user #{targetUserId}</span>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.delete('userId');
                                setSearchParams(params, { replace: true });
                            }}
                        >
                            Show all
                        </button>
                    </div>
                )}
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
