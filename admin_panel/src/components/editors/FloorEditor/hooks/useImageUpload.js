import { useCallback } from 'react';
import { convertImageToSvg } from '../utils';
import { isValidImageType, scheduleContainerUpdate } from './utils/imageUpload';

export const useImageUpload = (setEditorState, updateContainerSize) => {
    const handleImageUpload = useCallback(async (file) => {
        if (!file) {
            console.error('вќЊ No file provided to useImageUpload');
            return;
        }

        // РџСЂРѕРІРµСЂСЏРµРј С‚РёРї С„Р°Р№Р»Р°
        if (!isValidImageType(file.type)) {
            alert('РќРµРїРѕРґРґРµСЂР¶РёРІР°РµРјС‹Р№ С„РѕСЂРјР°С‚ С„Р°Р№Р»Р°. РСЃРїРѕР»СЊР·СѓР№С‚Рµ JPG, PNG, GIF РёР»Рё SVG.');
            return;
        }

        try {
            const svgContent = await convertImageToSvg(file);

            setEditorState(prev => ({
                ...prev,
                svgContent: svgContent,
                backgroundImage: file
            }));

            // Р”Р°РµРј РІСЂРµРјСЏ РЅР° СЂРµРЅРґРµСЂРёРЅРі, Р·Р°С‚РµРј С†РµРЅС‚СЂРёСЂСѓРµРј
            scheduleContainerUpdate(updateContainerSize);

        } catch (error) {
            console.error('вќЊ Error converting image to SVG:', error);
            alert('РћС€РёР±РєР° РїСЂРё Р·Р°РіСЂСѓР·РєРµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ: ' + error.message);
        }
    }, [setEditorState, updateContainerSize]);

    return {
        handleImageUpload
    };
};
