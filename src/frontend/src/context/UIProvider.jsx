import { useState } from 'react';
import { UIContext } from './UIContext';

export const UIProvider = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(false);

    // Persistent State for Workspace and Community
    const [workspaceState, setWorkspaceState] = useState({
        sortConfig: { title: '', date: '' },
        filterTags: [],
        searchValue: "",
        isExpanded: true
    });

    const [communityState, setCommunityState] = useState({
        sortConfig: { title: '', date: '' },
        filterTags: [],
        searchValue: "",
        page: 1
    });

    const value = {
        showSidebar,
        setShowSidebar,
        theme,
        setTheme,
        isLoading,
        setIsLoading,
        workspaceState,
        setWorkspaceState,
        communityState,
        setCommunityState
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
