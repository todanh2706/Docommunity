import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

export const AIModal = ({ isOpen, onClose, onGenerate, mode = 'generate', selectedText = '' }) => {
    const [prompt, setPrompt] = useState('');
    const [type, setType] = useState('document'); // default type
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("AIModal handleSubmit triggered. Prompt:", prompt);
        if (!prompt.trim()) return;

        setIsLoading(true);
        try {
            await onGenerate(type, prompt);
            setPrompt(''); // Reset after success
            onClose();
        } catch (error) {
            console.error("AI Generation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isRefineMode = mode === 'refine';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#252525]">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Sparkles size={20} />
                        <h2 className="text-lg font-semibold text-white">
                            {isRefineMode ? 'AI Refine Selection' : 'AI Generate'}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Selected Text Preview (Refine Mode Only) */}
                    {isRefineMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Selected Text</label>
                            <div className="w-full max-h-24 overflow-y-auto bg-[#252525] border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm italic">
                                "{selectedText}"
                            </div>
                        </div>
                    )}

                    {/* Type Selection (Generate Mode Only) */}
                    {!isRefineMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Content Type</label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            >
                                <option value="document">General Document</option>
                                <option value="email">Email</option>
                                <option value="blog">Blog Post</option>
                                <option value="code">Code Snippet</option>
                                <option value="summary">Summary</option>
                                <option value="outline">Outline</option>
                            </select>
                        </div>
                    )}

                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            {isRefineMode ? 'Instruction' : 'Prompt'}
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={isRefineMode ? "e.g. Make it more formal, Fix grammar..." : "Describe what you want the AI to write..."}
                            className="w-full h-32 bg-[#2b2b2b] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            autoFocus
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    {isRefineMode ? 'Refine' : 'Generate'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
