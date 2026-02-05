export const convertImageToSvg = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const imageData = e.target.result;

                // Создаем объект изображения для получения его реальных размеров
                const img = new Image();
                img.onload = () => {
                    const width = img.naturalWidth || img.width || 800;
                    const height = img.naturalHeight || img.height || 600;

                    console.log('Image dimensions:', { width, height });

                    // Создаем SVG с viewBox по размеру исходного изображения
                    const svgContent = `
                        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                            <image 
                                href="${imageData}" 
                                width="${width}" 
                                height="${height}" 
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </svg>
                    `;

                    resolve(svgContent);
                };

                img.onerror = () => {
                    console.warn('Could not load image, using default dimensions');
                    // Фоллбек на дефолтные размеры, если не удалось прочитать картинку
                    const svgContent = `
                        <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                            <image 
                                href="${imageData}" 
                                width="800" 
                                height="600" 
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </svg>
                    `;
                    resolve(svgContent);
                };

                img.src = imageData;

            } catch (error) {
                reject(new Error('Error processing image: ' + error.message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsDataURL(file);
    });
};
