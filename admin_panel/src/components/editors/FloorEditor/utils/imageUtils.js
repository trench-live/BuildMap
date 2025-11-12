/**
 * Валидация файла изображения
 */
export const validateImageFile = (file) => {
    if (!file) {
        return { isValid: false, error: 'Файл не выбран' };
    }

    // Проверка типа файла
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif',
        'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Поддерживаются только файлы изображений (JPG, PNG, SVG, GIF, WebP)'
        };
    }

    // Проверка размера файла (10MB максимум)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'Размер файла не должен превышать 10MB'
        };
    }

    return { isValid: true, error: null };
};

/**
 * Загрузка изображения с Promise
 */
export const loadImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve({
                image: img,
                dataUrl: e.target.result,
                width: img.width,
                height: img.height
            });
            img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
};

/**
 * Создание thumbnail изображения
 */
export const createThumbnail = (image, maxWidth = 200, maxHeight = 200) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = image;

        // Рассчет размеров для thumbnail
        if (width > height) {
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
    });
};