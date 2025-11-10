import React, { useState, useEffect } from 'react';
import { floorAPI, mappingAreaAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import DeleteModal from '../components/common/DeleteModal';
import FloorEditor from '../components/editors/floor_editor/FloorEditor';
import './Floors.css';

const Floors = () => {
    const [expandedArea, setExpandedArea] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editorVisible, setEditorVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', level: 1, description: '' });
    const [editingFloor, setEditingFloor] = useState(null);
    const [floorToDelete, setFloorToDelete] = useState(null);
    const [floors, setFloors] = useState({});
    const [loadingFloors, setLoadingFloors] = useState({});
    const [floorsCount, setFloorsCount] = useState({});

    const { data: areas, loading: areasLoading, execute: loadAreas } = useApi(() => mappingAreaAPI.getAll(false));

    // Загружаем количество этажей для всех зон при загрузке страницы
    useEffect(() => {
        if (areas && areas.length > 0) {
            loadFloorsCountForAllAreas();
        }
    }, [areas]);

    const loadFloorsCountForAllAreas = async () => {
        const counts = {};
        for (const area of areas) {
            try {
                const response = await floorAPI.getByArea(area.id, false);
                counts[area.id] = response.data.length;
            } catch (error) {
                console.error(`Error loading floors count for area ${area.id}:`, error);
                counts[area.id] = 0;
            }
        }
        setFloorsCount(counts);
    };

    const loadFloorsForArea = async (areaId) => {
        setLoadingFloors(prev => ({ ...prev, [areaId]: true }));
        try {
            const response = await floorAPI.getByArea(areaId, false);
            setFloors(prev => ({ ...prev, [areaId]: response.data }));
            // Обновляем счетчик при загрузке детальных данных
            setFloorsCount(prev => ({ ...prev, [areaId]: response.data.length }));
        } catch (error) {
            console.error('Error loading floors:', error);
        } finally {
            setLoadingFloors(prev => ({ ...prev, [areaId]: false }));
        }
    };

    const toggleArea = (areaId) => {
        if (expandedArea === areaId) {
            setExpandedArea(null);
        } else {
            setExpandedArea(areaId);
            if (!floors[areaId]) {
                loadFloorsForArea(areaId);
            }
        }
    };

    const handleSaveFloor = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert('Введите название этажа');

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
            if (expandedArea) {
                await loadFloorsForArea(expandedArea);
                await loadFloorsCountForAllAreas();
            }
        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteClick = (floor) => {
        setFloorToDelete(floor);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!floorToDelete) return;

        try {
            await floorAPI.delete(floorToDelete.id);
            setDeleteModalVisible(false);
            setFloorToDelete(null);
            if (expandedArea) {
                // Перезагружаем этажи и обновляем счетчик
                await loadFloorsForArea(expandedArea);
                // Также обновляем общий счетчик для всех зон
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

    const openCreateModal = (areaId) => {
        setEditingFloor(null);
        setFormData({
            name: '',
            level: (floorsCount[areaId] || 0) + 1,
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

    const openEditor = (floor) => {
        console.log('Opening editor for floor:', {
            id: floor.id,
            name: floor.name,
            hasSvgPlan: !!floor.svgPlan,
            svgPlanLength: floor.svgPlan?.length
        });
        setEditingFloor(floor);
        setEditorVisible(true);
    };

    const closeEditor = () => {
        setEditorVisible(false);
        setEditingFloor(null);
    };

    const getFloorLabel = (level) => {
        if (level === 0) return 'Паркинг';
        if (level === 1) return '1 этаж';
        if (level > 1) return `${level} этаж`;
        if (level < 0) return `Подвал ${Math.abs(level)}`;
        return `Уровень ${level}`;
    };

    const renderZoneContent = (area) => {
        if (loadingFloors[area.id]) {
            return <div className="loading">Загрузка этажей...</div>;
        }

        if (!floors[area.id]?.length) {
            return (
                <div className="empty-floors">
                    <p>В этой зоне пока нет этажей</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => openCreateModal(area.id)}
                    >
                        + Создать этаж
                    </button>
                </div>
            );
        }

        return (
            <div className="floors-section">
                <div className="floors-header">
                    <h4>Этажи зоны</h4>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openCreateModal(area.id)}
                    >
                        + Добавить этаж
                    </button>
                </div>

                <div className="floors-list">
                    {floors[area.id]
                        ?.sort((a, b) => (a.level || 0) - (b.level || 0))
                        .map(floor => (
                            <div key={floor.id} className="floor-item">
                                <div className="floor-main">
                                    <div className="floor-icon">🏗️</div>
                                    <div className="floor-info">
                                        <h5>{floor.name}</h5>
                                        <p className="floor-level">
                                            {getFloorLabel(floor.level)}
                                        </p>
                                        {floor.description && (
                                            <p className="floor-description">
                                                {floor.description}
                                            </p>
                                        )}
                                        {floor.svgPlan && (
                                            <p className="floor-description" style={{ color: '#007bff', fontSize: '12px' }}>
                                                📐 План загружен
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="floor-actions">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openEditor(floor)}
                                    >
                                        📐 Редактировать план
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openEditModal(floor)}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDeleteClick(floor)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="floors-page">
            <div className="page-header">
                <h1>🏢 Управление этажами</h1>
                <p>Создавайте и управляйте этажами для indoor навигации</p>
            </div>

            {areasLoading && <div className="loading">Загрузка зон...</div>}

            {areas?.map(area => (
                <div key={area.id} className="zone-item">
                    <div
                        className={`zone-header ${expandedArea === area.id ? 'expanded' : ''}`}
                        onClick={() => toggleArea(area.id)}
                    >
                        <div className="zone-info">
                            <div className="zone-icon">🗺️</div>
                            <div className="zone-content">
                                <h3>{area.name}</h3>
                                <p>{area.description || 'Описание отсутствует'}</p>
                            </div>
                        </div>
                        <div className="zone-actions">
                            <span className="zone-meta">
                                {floorsCount[area.id] ?? 0} этажей
                            </span>
                            <span className="expand-icon">
                                {expandedArea === area.id ? '▼' : '►'}
                            </span>
                        </div>
                    </div>

                    {expandedArea === area.id && (
                        <div className="zone-content-area">
                            {renderZoneContent(area)}
                        </div>
                    )}
                </div>
            ))}

            {/* Модальное окно создания/редактирования этажа */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingFloor ? 'Редактирование этажа' : 'Создание этажа'}</h3>
                            <button className="close-btn" onClick={() => setModalVisible(false)}>×</button>
                        </div>

                        <form onSubmit={handleSaveFloor}>
                            <div className="form-group">
                                <label>Название этажа *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Например: Главный холл"
                                />
                            </div>

                            <div className="form-group">
                                <label>Уровень этажа</label>
                                <input
                                    type="number"
                                    value={formData.level}
                                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                    min="-5"
                                    max="50"
                                />
                                <div className="form-hint">
                                    {getFloorLabel(formData.level)}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Описание</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Описание этажа..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingFloor ? 'Сохранить' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно редактора этажа */}
            <FloorEditor
                floor={editingFloor}
                visible={editorVisible}
                onClose={closeEditor}
                onSave={() => {
                    // Обновляем данные после сохранения
                    if (expandedArea) {
                        loadFloorsForArea(expandedArea);
                    }
                }}
            />

            {/* Модальное окно удаления */}
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