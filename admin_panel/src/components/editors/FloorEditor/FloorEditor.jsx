import React, { useState, useEffect, useCallback } from 'react';
import { useFloorEditor, useImageUpload, useFulcrums } from './hooks';
import EditorHeader from './components/EditorHeader/EditorHeader';
import EditorToolbar from './components/EditorToolbar/EditorToolbar';
import SvgCanvas from './components/SvgCanvas/SvgCanvas';
import FulcrumModal from './components/FulcrumModal/FulcrumModal';
import ConnectionModal from './components/ConnectionModal/ConnectionModal';
import './FloorEditor.css';

const FloorEditor = ({ floor, visible, onClose, onSave }) => {
    const {
        editorState,
        setEditorState,
        isSaving: floorSaving, // переименовываем, чтобы избежать конфликта
        handleSave: handleFloorSave,
        handleZoom,
        handleResetView,
        handleClearCanvas,
        setMode,
        svgSize,
        updateContainerSize
    } = useFloorEditor(floor, onSave, onClose);

    const { handleImageUpload } = useImageUpload(setEditorState);

    // Локальное состояние для сохранения
    const [isSaving, setIsSaving] = useState(false);

    // Подключаем систему fulcrums
    const {
        fulcrums,
        connections,
        isLoading: fulcrumsLoading,
        createFulcrum,
        updateFulcrum,
        deleteFulcrum,
        addConnection,
        removeConnection,
        reloadFulcrums
    } = useFulcrums(floor?.id);

    // Состояние для модальных окон
    const [fulcrumModal, setFulcrumModal] = useState({
        visible: false,
        mode: 'create', // 'create' или 'edit'
        fulcrum: null,
        position: null
    });

    const [connectionModal, setConnectionModal] = useState({
        visible: false,
        mode: 'create', // 'create' или 'edit'
        connection: null,
        fromFulcrum: null,
        toFulcrum: null
    });

    // Перезагружаем fulcrums при каждом открытии редактора
    useEffect(() => {
        if (visible && floor?.id) {
            reloadFulcrums();
        }
    }, [visible, floor?.id, reloadFulcrums]);

    // Функция сохранения с перезагрузкой fulcrums
    const handleSaveWithReload = useCallback(async () => {
        if (!editorState.svgContent.trim()) {
            alert('Холст пуст. Загрузите изображение или создайте план.');
            return;
        }

        setIsSaving(true);
        try {
            // Сохраняем этаж через существующий handleSave
            await handleFloorSave();

            // Перезагружаем fulcrums после успешного сохранения
            await reloadFulcrums();

            console.log('✅ Floor saved and fulcrums reloaded');
        } catch (error) {
            alert('Ошибка сохранения: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    }, [editorState.svgContent, handleFloorSave, reloadFulcrums]);

    // Обработка создания fulcrum по ПКМ
    const handleFulcrumCreate = (position, event) => {
        setFulcrumModal({
            visible: true,
            mode: 'create',
            fulcrum: null,
            position: position
        });
    };

    // Обработка контекстного меню fulcrum (ПКМ по существующей точке)
    const handleFulcrumContextMenu = (fulcrum, event) => {
        event.preventDefault();
        event.stopPropagation();

        setFulcrumModal({
            visible: true,
            mode: 'edit',
            fulcrum: fulcrum,
            position: null
        });
    };

    // Обработка создания связи (перетаскивание)
    const handleConnectionCreate = (fromFulcrum, toFulcrum) => {
        setConnectionModal({
            visible: true,
            mode: 'create',
            connection: null,
            fromFulcrum: fromFulcrum,
            toFulcrum: toFulcrum
        });
    };

    // Обработка контекстного меню связи (ПКМ по связи)
    const handleConnectionContextMenu = (connection, event) => {
        event.preventDefault();
        event.stopPropagation();

        const fromFulcrum = fulcrums.find(f => f.id === connection.from);
        const toFulcrum = fulcrums.find(f => f.id === connection.to);

        setConnectionModal({
            visible: true,
            mode: 'edit',
            connection: connection,
            fromFulcrum: fromFulcrum,
            toFulcrum: toFulcrum
        });
    };

    // Сохранение fulcrum
    const handleFulcrumSave = async (fulcrumData) => {
        try {
            if (fulcrumModal.mode === 'create') {
                const newFulcrum = await createFulcrum(fulcrumData);
                console.log('Fulcrum created:', newFulcrum);
            } else {
                // При обновлении отправляем все данные, включая координаты и floorId
                await updateFulcrum(fulcrumModal.fulcrum.id, fulcrumData);
                console.log('Fulcrum updated');
            }
            setFulcrumModal({ visible: false, mode: 'create', fulcrum: null, position: null });
        } catch (error) {
            alert(error.message);
        }
    };

    // Удаление fulcrum
    const handleFulcrumDelete = async () => {
        if (fulcrumModal.mode === 'edit' && fulcrumModal.fulcrum) {
            try {
                await deleteFulcrum(fulcrumModal.fulcrum.id);
                setFulcrumModal({ visible: false, mode: 'create', fulcrum: null, position: null });
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Сохранение связи
    const handleConnectionSave = async (connectionData) => {
        try {
            if (connectionModal.mode === 'create') {
                await addConnection(connectionModal.fromFulcrum.id, {
                    connectedFulcrumId: connectionModal.toFulcrum.id,
                    weight: connectionData.weight
                });
                console.log('Connection created');
            } else {
                // Для обновления связи нужно удалить старую и создать новую
                await removeConnection(connectionModal.connection.from, connectionModal.connection.to);
                await addConnection(connectionModal.fromFulcrum.id, {
                    connectedFulcrumId: connectionModal.toFulcrum.id,
                    weight: connectionData.weight
                });
                console.log('Connection updated');
            }
            setConnectionModal({ visible: false, mode: 'create', connection: null, fromFulcrum: null, toFulcrum: null });
        } catch (error) {
            alert(error.message);
        }
    };

    // Удаление связи
    const handleConnectionDelete = async () => {
        if (connectionModal.mode === 'edit' && connectionModal.connection) {
            try {
                await removeConnection(connectionModal.connection.from, connectionModal.connection.to);
                setConnectionModal({ visible: false, mode: 'create', connection: null, fromFulcrum: null, toFulcrum: null });
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal floor-editor-modal">
                <EditorHeader
                    floorName={floor?.name}
                    onClose={onClose}
                />

                <div className="floor-editor-content">
                    <EditorToolbar
                        onImageUpload={handleImageUpload}
                        onZoomIn={() => handleZoom(1.2)}
                        onZoomOut={() => handleZoom(0.8)}
                        onResetView={handleResetView}
                        onClearCanvas={handleClearCanvas}
                        onSave={handleSaveWithReload}
                        scale={editorState.scale}
                        hasContent={!!editorState.svgContent}
                        isSaving={isSaving || floorSaving}
                        fulcrumsCount={fulcrums.length}
                        connectionsCount={connections.length}
                    />

                    <SvgCanvas
                        editorState={editorState}
                        setEditorState={setEditorState}
                        fulcrums={fulcrums}
                    connections={connections}
                    svgSize={svgSize}
                    updateContainerSize={updateContainerSize}
                    onFulcrumCreate={handleFulcrumCreate}
                    onFulcrumContextMenu={handleFulcrumContextMenu}
                    onConnectionCreate={handleConnectionCreate}
                    onConnectionContextMenu={handleConnectionContextMenu}
                />
                </div>

                {/* Модальное окно для fulcrum */}
                <FulcrumModal
                    visible={fulcrumModal.visible}
                    mode={fulcrumModal.mode}
                    fulcrum={fulcrumModal.fulcrum}
                    position={fulcrumModal.position}
                    floorId={floor?.id}
                    onSave={handleFulcrumSave}
                    onDelete={handleFulcrumDelete}
                    onClose={() => setFulcrumModal({ visible: false, mode: 'create', fulcrum: null, position: null })}
                />

                {/* Модальное окно для связи */}
                <ConnectionModal
                    visible={connectionModal.visible}
                    mode={connectionModal.mode}
                    connection={connectionModal.connection}
                    fromFulcrum={connectionModal.fromFulcrum}
                    toFulcrum={connectionModal.toFulcrum}
                    onSave={handleConnectionSave}
                    onDelete={handleConnectionDelete}
                    onClose={() => setConnectionModal({ visible: false, mode: 'create', connection: null, fromFulcrum: null, toFulcrum: null })}
                />
            </div>
        </div>
    );
};

export default FloorEditor;
