import { useCallback } from 'react';
import { validateImageFile, loadImage } from '../utils/imageUtils';
import { createSvgFromImage } from '../utils/svgHelpers';

export const useImageUpload = (setEditorState) => {
    const handleImageUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Валидация файла
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        try {
            const { image, dataUrl } = await loadImage(file);

            const svg = createSvgFromImage(dataUrl, image.width, image.height);

            setEditorState(prev => ({
                ...prev,
                svgContent: svg,
                backgroundImage: dataUrl,
                scale: 1,
                offset: { x: 0, y: 0 }
            }));

            // Сбрасываем input для возможности загрузки того же файла снова
            event.target.value = '';
        } catch (error) {
            alert('Ошибка загрузки изображения: ' + error.message);
        }
    }, [setEditorState]);

    return {
        handleImageUpload
    };
};