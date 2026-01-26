import React, { useState, useEffect, useCallback } from 'react';
import { useFloorEditor, useImageUpload, useFulcrums } from './hooks';
import useEditorModals from './hooks/useEditorModals';
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
        handleResetView,
        handleClearCanvas,
        setMode,
        svgSize,
        updateContainerSize,
        toggleGrid,
        increaseGridStep,
        decreaseGridStep
    } = useFloorEditor(floor, onSave, onClose);

    const { handleImageUpload } = useImageUpload(setEditorState);

    // Локальное состояние для сохранения
    const [isSaving, setIsSaving] = useState(false);

    // Подключаем систему fulcrums
    const {
        fulcrums,
        connections,
        createFulcrum,
        updateFulcrum,
        deleteFulcrum,
        addConnection,
        removeConnection,
        reloadFulcrums
    } = useFulcrums(floor?.id);

    // Состояние для модальных окон
    const {
        fulcrumModal,
        connectionModal,
        handleFulcrumCreate,
        handleFulcrumContextMenu,
        handleConnectionCreate,
        handleConnectionContextMenu,
        handleFulcrumSave,
        handleFulcrumDelete,
        handleConnectionSave,
        handleConnectionDelete,
        closeFulcrumModal,
        closeConnectionModal
    } = useEditorModals({
        fulcrums,
        connections,
        createFulcrum,
        updateFulcrum,
        deleteFulcrum,
        addConnection,
        removeConnection
    });

    // ????????????? fulcrums ??? ?????? ???????? ?????????
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
                        onResetView={handleResetView}
                        onClearCanvas={handleClearCanvas}
                        onSave={handleSaveWithReload}
                        onToggleGrid={toggleGrid}
                        onGridStepIncrease={increaseGridStep}
                        onGridStepDecrease={decreaseGridStep}
                        scale={editorState.scale}
                        gridEnabled={editorState.gridEnabled}
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
                    mappingAreaId={floor?.mappingAreaId}
                    onSave={handleFulcrumSave}
                    onDelete={handleFulcrumDelete}
                    onClose={closeFulcrumModal}
                />

                {/* Модальное окно для связи */}
                <ConnectionModal
                    visible={connectionModal.visible}
                    mode={connectionModal.mode}
                    connection={connectionModal.connection}
                    isBidirectional={connectionModal.isBidirectional}
                    fromFulcrum={connectionModal.fromFulcrum}
                    toFulcrum={connectionModal.toFulcrum}
                    onSave={handleConnectionSave}
                    onDelete={handleConnectionDelete}
                    onClose={closeConnectionModal}
                />
            </div>
        </div>
    );
};

export default FloorEditor;
