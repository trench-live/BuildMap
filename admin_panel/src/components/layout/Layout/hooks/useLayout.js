import { useState } from 'react';

export const useLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(prev => !prev);
    };

    return {
        collapsed,
        toggleSidebar,
        setCollapsed
    };
};