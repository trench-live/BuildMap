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
        isSaving: floorSaving, // РїРµСЂРµРёРјРµРЅРѕРІС‹РІР°РµРј, С‡С‚РѕР±С‹ РёР·Р±РµР¶Р°С‚СЊ РєРѕРЅС„Р»РёРєС‚Р°
        handleSave: handleFloorSave,
        handleResetView,
        handleClearCanvas,
        svgSize,
        updateContainerSize,
        toggleGrid,
        toggleMoveFulcrums,
        increaseGridStep,
        decreaseGridStep
    } = useFloorEditor(floor, onSave, onClose);

    const { handleImageUpload } = useImageUpload(setEditorState);

    // Р›РѕРєР°Р»СЊРЅРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ
    const [isSaving, setIsSaving] = useState(false);

    // РџРѕРґРєР»СЋС‡Р°РµРј СЃРёСЃС‚РµРјСѓ fulcrums
    const {
        fulcrums,
        connections,
        createFulcrum,
        updateFulcrum,
        moveFulcrums,
        deleteFulcrum,
        addConnection,
        removeConnection,
        reloadFulcrums
    } = useFulcrums(floor?.id);

    // РЎРѕСЃС‚РѕСЏРЅРёРµ РґР»СЏ РјРѕРґР°Р»СЊРЅС‹С… РѕРєРѕРЅ
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

    // Р¤СѓРЅРєС†РёСЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ СЃ РїРµСЂРµР·Р°РіСЂСѓР·РєРѕР№ fulcrums
    const handleSaveWithReload = useCallback(async () => {
        if (!editorState.svgContent.trim()) {
            alert('РҐРѕР»СЃС‚ РїСѓСЃС‚. Р—Р°РіСЂСѓР·РёС‚Рµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ РёР»Рё СЃРѕР·РґР°Р№С‚Рµ РїР»Р°РЅ.');
            return;
        }

        setIsSaving(true);
        try {
            // РЎРѕС…СЂР°РЅСЏРµРј СЌС‚Р°Р¶ С‡РµСЂРµР· СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ handleSave
            await handleFloorSave();

            // РџРµСЂРµР·Р°РіСЂСѓР¶Р°РµРј fulcrums РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЃРѕС…СЂР°РЅРµРЅРёСЏ
            await reloadFulcrums();
        } catch (error) {
            alert('РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ: ' + (error.response?.data?.message || error.message));
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
                        onToggleMoveFulcrums={toggleMoveFulcrums}
                        onClearCanvas={handleClearCanvas}
                        onSave={handleSaveWithReload}
                        onToggleGrid={toggleGrid}
                        onGridStepIncrease={increaseGridStep}
                        onGridStepDecrease={decreaseGridStep}
                        scale={editorState.scale}
                        moveFulcrumsEnabled={editorState.moveFulcrumsEnabled}
                        gridEnabled={editorState.gridEnabled}
                        hasContent={!!editorState.svgContent}
                        isSaving={isSaving || floorSaving}
                        fulcrumsCount={fulcrums.length}
                        connectionsCount={connections.length}
                        selectedFulcrumsCount={editorState.selectedFulcrumIds?.length || 0}
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
                        onFulcrumsMove={moveFulcrums}
                        onConnectionCreate={handleConnectionCreate}
                        onConnectionContextMenu={handleConnectionContextMenu}
                    />
                </div>

                {/* РњРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ РґР»СЏ fulcrum */}
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

                {/* РњРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ РґР»СЏ СЃРІСЏР·Рё */}
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
