import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (key) => {
        navigate(key);
    };

    return {
        currentPath: location.pathname,
        handleMenuClick
    };
};