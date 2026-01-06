import React, { createContext, useContext, useState, useEffect } from 'react';

// Default AI settings
const defaultSettings = {
    chatbotEnabled: true,
    writingSuggestionEnabled: true,
    generateDocumentEnabled: true
};

// Create context
const AISettingsContext = createContext();

// LocalStorage key
const STORAGE_KEY = 'docommunity_ai_settings';

export function AISettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        // Load from localStorage on init
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleChatbot = () => updateSetting('chatbotEnabled', !settings.chatbotEnabled);
    const toggleWritingSuggestion = () => updateSetting('writingSuggestionEnabled', !settings.writingSuggestionEnabled);
    const toggleGenerateDocument = () => updateSetting('generateDocumentEnabled', !settings.generateDocumentEnabled);

    return (
        <AISettingsContext.Provider value={{
            ...settings,
            toggleChatbot,
            toggleWritingSuggestion,
            toggleGenerateDocument
        }}>
            {children}
        </AISettingsContext.Provider>
    );
}

export function useAISettings() {
    const context = useContext(AISettingsContext);
    if (!context) {
        throw new Error('useAISettings must be used within AISettingsProvider');
    }
    return context;
}
