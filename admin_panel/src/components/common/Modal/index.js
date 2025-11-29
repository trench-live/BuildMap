// Экспорт модальных окон
export { default as DeleteModal } from './DeleteModal';

// Экспорт базовых компонентов для создания кастомных модалок
export { default as Modal } from './components/Modal/Modal';
export { default as ModalOverlay } from './components/ModalOverlay/ModalOverlay';
export { default as ModalHeader } from './components/ModalHeader/ModalHeader';
export { default as ModalContent } from './components/ModalContent/ModalContent';
export { default as ModalActions } from './components/ModalActions/ModalActions';

// Экспорт хуков
export { useModal } from './hooks/useModal';