import { useState } from 'react';
import { UIContext } from './UIContext';

export const UIProvider = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(false);

    const value = {
        showSidebar,
        setShowSidebar,
        theme,
        setTheme,
        isLoading,
        setIsLoading,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
