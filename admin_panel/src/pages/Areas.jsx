import React, { useState } from 'react';
import { mappingAreaAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import DeleteModal from '../components/common/DeleteModal';

const Areas = () => {
    const { user } = useAuth();
    const { data: areas, loading, error, execute: loadAreas } = useApi(() => mappingAreaAPI.getAll(false));
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [areaToDelete, setAreaToDelete] = useState(null);
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
                alert('Зона обновлена!');
            } else {
                await mappingAreaAPI.create({
                    name: formData.name,
                    description: formData.description,
                    userIds: [user.id]
                });
                alert('Зона создана!');
            }

            setModalVisible(false);
            setEditingArea(null);
            setFormData({ name: '', description: '' });
            loadAreas();

        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteClick = (area) => {
        setAreaToDelete(area);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!areaToDelete) return;

        try {
            await mappingAreaAPI.delete(areaToDelete.id);
            alert('Зона удалена!');
            setDeleteModalVisible(false);
            setAreaToDelete(null);
            loadAreas();
        } catch (error) {
            alert('Ошибка удаления: ' + (error.response?.data?.message || error.message));
            setDeleteModalVisible(false);
            setAreaToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setAreaToDelete(null);
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

    const renderAreaCard = (area) => (
        <div key={area.id} className="card" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{area.name}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                        {area.description || 'Описание отсутствует'}
                    </p>
                    <div style={{ fontSize: '14px', color: '#888' }}>
                        📁 ID: {area.id} • 👥 Пользователей: {area.userIds?.length || 1}
                        {user && area.userIds?.includes(user.id) && (
                            <span style={{ color: '#28a745', marginLeft: '10px' }}>
                                ✅ Ваша зона
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleEditArea(area)}
                    >
                        ✏️ Редактировать
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleDeleteClick(area)}
                    >
                        🗑️ Удалить
                    </button>
                    <button className="btn btn-primary">
                        → К этажам
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>🗺️ Мои картографические зоны</h2>
                    <button className="btn btn-primary" onClick={handleCreateArea}>
                        + Добавить зону
                    </button>
                </div>

                {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>}

                {error && (
                    <div style={{
                        background: '#ffe6e6',
                        color: '#d00',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                    }}>
                        Ошибка: {error}
                    </div>
                )}

                {!loading && areas && areas.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        У вас пока нет картографических зон. Создайте первую!
                    </div>
                )}

                {areas && areas.map(renderAreaCard)}
            </div>

            {/* Модальное окно создания/редактирования */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingArea ? 'Редактирование зоны' : 'Создание новой зоны'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSaveArea}>
                            <div className="form-group">
                                <label className="form-label">Название зоны *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Введите название зоны"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Описание</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Введите описание зоны"
                                />
                            </div>

                            {!editingArea && (
                                <div style={{
                                    background: '#f0f9ff',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#0369a1',
                                    marginBottom: '15px'
                                }}>
                                    💡 Зона будет автоматически привязана к вашему аккаунту
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingArea ? 'Сохранить' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Универсальное модальное окно подтверждения удаления */}
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