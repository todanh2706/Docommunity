import React from 'react';
import { Sparkles, MessageSquare, FileText, Bot } from 'lucide-react';
import { useAISettings } from '../../context/AISettingsContext';

export default function AISettingsSection() {
    const {
        chatbotEnabled,
        writingSuggestionEnabled,
        generateDocumentEnabled,
        toggleChatbot,
        toggleWritingSuggestion,
        toggleGenerateDocument
    } = useAISettings();

    const ToggleSwitch = ({ enabled, onToggle, label, description, icon: Icon }) => (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-500'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="text-white font-medium">{label}</h4>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#141824] rounded-2xl border border-white/10 p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles size={24} className="text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">AI Features</h3>
                    <p className="text-gray-400 text-sm">Manage AI-powered features</p>
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
                <ToggleSwitch
                    enabled={chatbotEnabled}
                    onToggle={toggleChatbot}
                    label="AI Chatbot"
                    description="Show AI assistant chat bubble"
                    icon={Bot}
                />

                <ToggleSwitch
                    enabled={writingSuggestionEnabled}
                    onToggle={toggleWritingSuggestion}
                    label="Writing Suggestions"
                    description="AI-powered inline text suggestions while typing"
                    icon={MessageSquare}
                />

                <ToggleSwitch
                    enabled={generateDocumentEnabled}
                    onToggle={toggleGenerateDocument}
                    label="Generate Document"
                    description="AI content generation in editor"
                    icon={FileText}
                />
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-300 text-xs">
                    💡 These settings are saved locally and will persist across sessions.
                </p>
            </div>
        </div>
    );
}
