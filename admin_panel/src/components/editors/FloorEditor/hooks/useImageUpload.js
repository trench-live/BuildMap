import { useCallback } from 'react';
import { convertImageToSvg } from '../utils';

export const useImageUpload = (setEditorState, updateContainerSize) => {
    const handleImageUpload = useCallback(async (file) => {
        if (!file) {
            console.error('❌ No file provided to useImageUpload');
            return;
        }

        // Проверяем тип файла
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            alert('Неподдерживаемый формат файла. Используйте JPG, PNG, GIF или SVG.');
            return;
        }

        console.log('📤 Uploading image:', file.name, file.type, file.size);

        try {
            const svgContent = await convertImageToSvg(file);

            setEditorState(prev => ({
                ...prev,
                svgContent: svgContent,
                backgroundImage: file
            }));

            console.log('✅ Image converted to SVG successfully');

            // Даем время на рендеринг, затем центрируем
            setTimeout(() => {
                if (updateContainerSize) {
                    // Триггерим обновление размеров
                    updateContainerSize();
                }
            }, 100);

        } catch (error) {
            console.error('❌ Error converting image to SVG:', error);
            alert('Ошибка при загрузке изображения: ' + error.message);
        }
    }, [setEditorState, updateContainerSize]);

    return {
        handleImageUpload
    };
};