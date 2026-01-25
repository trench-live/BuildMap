const VALID_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml'
];

const isValidImageType = (fileType) => VALID_IMAGE_TYPES.includes(fileType);

const scheduleContainerUpdate = (updateContainerSize) => {
    if (!updateContainerSize) return;
    setTimeout(() => {
        updateContainerSize();
    }, 100);
};

export { VALID_IMAGE_TYPES, isValidImageType, scheduleContainerUpdate };
