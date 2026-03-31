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

                // РЎРѕР·РґР°РµРј РѕР±СЉРµРєС‚ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РµРіРѕ СЂРµР°Р»СЊРЅС‹С… СЂР°Р·РјРµСЂРѕРІ
                const img = new Image();
                img.onload = () => {
                    const width = img.naturalWidth || img.width || 800;
                    const height = img.naturalHeight || img.height || 600;

                    // РЎРѕР·РґР°РµРј SVG СЃ viewBox РїРѕ СЂР°Р·РјРµСЂСѓ РёСЃС…РѕРґРЅРѕРіРѕ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
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
                    // Р¤РѕР»Р»Р±РµРє РЅР° РґРµС„РѕР»С‚РЅС‹Рµ СЂР°Р·РјРµСЂС‹, РµСЃР»Рё РЅРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕС‡РёС‚Р°С‚СЊ РєР°СЂС‚РёРЅРєСѓ
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
