import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { DocumentSettingsModal } from '../components/Layout/Modal'
import { ShareModal } from '../components/Layout/Modal'
import { AIModal } from '../components/Layout/AIModal'
import { Link, useLocation, useParams } from "react-router-dom";
import { useDocument } from "../context/DocumentContext";
import { useAISettings } from "../context/AISettingsContext";
import { useUser } from '../hooks/useUser';
import { generateContent, refineContent, getWritingSuggestion, suggestTags } from '../services/AIService';
import { resolveShareToken } from '../services/documentService';
import { useDocumentCollab } from '../hooks/useDocumentCollab';

import Markdown from 'react-markdown';


import remarkGfm from 'remark-gfm';
import remarkDirective from "remark-directive";
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { visit } from 'unist-util-visit';

function remarkHighlightPlugin() {
    return (tree) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                if (node.name === 'mark') {
                    const data = node.data || (node.data = {});
                    data.hName = 'mark';
                }
            }
        });
    };
}

import { useTagService } from '../services/tagService';
import {
    Edit2, Bookmark, Tag, MessageSquareText, Columns2,
    Undo2, Redo2, Bold, Italic, Underline, Code, Table as TableIcon,
    List, Link as LinkIcon, Image as ImageIcon, Strikethrough, ListOrdered, SquareCheck, Eye, Pencil,
    GripVertical, X, User, Sparkles, Cloud, CloudOff, Loader, CheckCircle, Search, Globe, Lock, Plus // Đảm bảo đã import User và X
} from "lucide-react";




const SettingsPanel = ({ isOpen, onClose, tags, privacy, onSave, availableTags, aiSuggestedTags = [], onAISuggest, isLoadingSuggestions = false }) => {
    const [localTags, setLocalTags] = useState(tags);
    const [localPrivacy, setLocalPrivacy] = useState(privacy);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            setLocalTags(tags);
            setLocalPrivacy(privacy);
        }
    }, [isOpen, tags, privacy]);

    if (!isOpen) return null;

    const filteredSuggestions = availableTags.length > 0
        ? availableTags.filter(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase()) && !localTags.includes(tag))
        : [];

    const handleAddTag = (tag) => {
        if (!localTags.includes(tag)) {
            setLocalTags([...localTags, tag]);
            setSearchTerm("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setLocalTags(localTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== "") {
            handleAddTag(searchTerm.trim());
        }
    };

    const handleSave = () => {
        onSave(localTags, localPrivacy);
        onClose();
    };

    return (
        <div className="absolute top-4  right-6 w-80 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl z-[9999] flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#1e1f22] rounded-t-xl">
                <div className="flex items-center gap-2 text-white font-semibold">
                    <Tag size={16} />
                    <span>Settings</span>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar max-h-[400px]">
                {/* Privacy */}
                <div>
                    <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Privacy</label>
                    <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${localPrivacy === 'public' ? 'bg-blue-900/20 border-blue-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="privacy"
                                value="public"
                                checked={localPrivacy === 'public'}
                                onChange={(e) => setLocalPrivacy(e.target.value)}
                                className="hidden"
                            />
                            <Globe size={16} className={localPrivacy === 'public' ? "text-blue-400" : "text-gray-400"} />
                            <span className={`text-sm font-medium ${localPrivacy === 'public' ? "text-blue-100" : "text-gray-300"}`}>Public</span>
                            {localPrivacy === 'public' && <CheckIcon className="ml-auto text-blue-400" size={14} />}
                        </label>

                        <label className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${localPrivacy === 'private' ? 'bg-red-900/20 border-red-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="privacy"
                                value="private"
                                checked={localPrivacy === 'private'}
                                onChange={(e) => setLocalPrivacy(e.target.value)}
                                className="hidden"
                            />
                            <Lock size={16} className={localPrivacy === 'private' ? "text-red-400" : "text-gray-400"} />
                            <span className={`text-sm font-medium ${localPrivacy === 'private' ? "text-red-100" : "text-gray-300"}`}>Private</span>
                            {localPrivacy === 'private' && <CheckIcon className="ml-auto text-red-400" size={14} />}
                        </label>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Tags</label>

                    {/* Tag List */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {localTags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-white transition">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {localTags.length === 0 && <span className="text-gray-500 text-xs italic">No tags assigned</span>}
                    </div>

                    {/* Search/Add */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            className="w-full bg-[#2b2d31] text-white text-sm pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 transition placeholder:text-gray-600"
                            placeholder="Add tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        {/* Suggestions Dropdown */}
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#2b2d31] border border-white/10 rounded-lg shadow-xl max-h-32 overflow-y-auto z-10">
                                {filteredSuggestions.length > 0 ? (
                                    filteredSuggestions.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            className="w-full text-left px-3 py-2 hover:bg-white/5 text-gray-300 text-sm flex items-center justify-between group"
                                        >
                                            <span>{tag}</span>
                                            <Plus size={12} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        onClick={() => handleAddTag(searchTerm)}
                                        className="w-full text-left px-3 py-2 hover:bg-white/5 text-blue-400 text-sm italic flex items-center gap-2"
                                    >
                                        <Plus size={12} /> Create "{searchTerm}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Suggestions */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Suggestions</label>
                            <button
                                onClick={onAISuggest}
                                disabled={isLoadingSuggestions}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                            >
                                <Sparkles size={12} className={isLoadingSuggestions ? 'animate-spin' : ''} />
                                {isLoadingSuggestions ? 'Generating...' : 'Suggest Tags'}
                            </button>
                        </div>

                        {aiSuggestedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {aiSuggestedTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleAddTag(tag)}
                                        disabled={localTags.includes(tag)}
                                        className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded border border-purple-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <Plus size={10} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end gap-2 bg-[#1e1f22] rounded-b-xl">
                <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">Save Changes</button>
            </div>
        </div>
    );
};

const CheckIcon = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const ToolbarBtn = ({ icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-1.5 text-gray-400 rounded-md ${isActive ? 'bg-gray-700 text-white' : ''} hover:bg-gray-700 hover:text-white transition-all duration-200`}
    >
        <Icon size={18} />
    </button>
);

const Divider = () => <div className="h-5 w-[1px] bg-gray-700 mx-1"></div>;

// --- DUMMY DATA ---
const INITIAL_COMMENTS = [
    { id: 1, user: "User01", avatar: null, content: "ADFJSKDLJFLADKSFJA;DSL...", time: "5 min ago" },
    { id: 2, user: "User02", avatar: null, content: "Đoạn này cần sửa lại logic markdown.", time: "10 min ago" },
    { id: 3, user: "User03", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s", content: "Hello everyone my name is user03", time: "1 hour ago" },
];

export default function EditorPage({ initialContent = '' }) {
    // --- 1. KHAI BÁO STATE (QUAN TRỌNG: PHẢI CÓ ĐỦ Ở ĐÂY) ---
    // Khởi tạo state với giá trị mặc định (rỗng hoặc giá trị từ document nếu có)
    const location = useLocation();
    const { token: shareTokenParam } = useParams();
    const [document, setDocument] = useState(location.state?.document || null);
    const [shareToken, setShareToken] = useState(shareTokenParam || null);
    const isAnonymousShare = Boolean(shareTokenParam) && !localStorage.getItem('accessToken');
    const [title, setTitle] = useState(document?.title || "");
    const [markdown, setMarkdown] = useState(document?.content || "");
    const [activeTags, setActiveTags] = useState(document?.tags || []); // Sử dụng tags từ document
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving', 'error'
    const [scrollTick, setScrollTick] = useState(0);

    // State cho Toolbar & UI
    const [selectedTools, setSelectedTools] = useState([]);
    const [isOpen, setIsOpen] = useState(false); // User dropdown

    // State cho Resize
    const [isResizing, setIsResizing] = useState(false);
    const [editorRatio, setEditorRatio] = useState(50);

    // State cho Comment (NẾU THIẾU DÒNG NÀY NÚT SẼ KHÔNG CHẠY)
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(INITIAL_COMMENTS);
    const [newCommentText, setNewCommentText] = useState("");
    const [isInputActive, setIsInputActive] = useState(true); // <--- KIỂM TRA DÒNG NÀY

    // Refs
    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const suggestionTimeoutRef = useRef(null);
    const lastSavedTitleRef = useRef(document?.title || "");
    const contentSendTimeoutRef = useRef(null);

    // Writing Suggestion State
    const [writingSuggestion, setWritingSuggestion] = useState('');
    const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
    // Collaborative mode: when true, show bottom bar; when false, show inline ghost text
    const [isCollaborativeMode, setIsCollaborativeMode] = useState(false);

    //Toasts
    const { success } = useToast();
    const [isBookmark, setIsBookmark] = useState(true)

    // AI Settings
    const { writingSuggestionEnabled, generateDocumentEnabled } = useAISettings();

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Tag Settings Panel State
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [aiSuggestedTags, setAiSuggestedTags] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);


    const [viewMode, setViewMode] = useState(() => {
        if (location.state?.viewMode) return location.state.viewMode;
        const savedMode = localStorage.getItem('editorViewMode');
        return savedMode || 'side-by-side';
    });

    useEffect(() => {
        localStorage.setItem('editorViewMode', viewMode);
    }, [viewMode]);
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (contentSendTimeoutRef.current) {
                clearTimeout(contentSendTimeoutRef.current);
            }
        };
    }, []);

    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiMode, setAiMode] = useState('generate'); // 'generate' | 'refine'
    const [selectedTextForAI, setSelectedTextForAI] = useState('');
    const [selectionRange, setSelectionRange] = useState(null);
    const [quickRefinePos, setQuickRefinePos] = useState(null);
    const [privacy, setPrivacy] = useState(document?.isPublic ? 'public' : 'private');
    const [availableTags, setAvailableTags] = useState([]);
    const { getAllTags } = useTagService();
    const { getUserProfile } = useUser();
    const [userData, setUserData] = useState({
        fullname: "User",
        email: "user@example.com",
        avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s"
    });

    useEffect(() => {
        if (isTagEditorOpen) {
            getAllTags().then(tags => setAvailableTags([...new Set(tags)]));
        }
    }, [isTagEditorOpen]);

    useEffect(() => {
        if (!localStorage.getItem('accessToken')) {
            return;
        }
        const fetchUser = async () => {
            try {
                const data = await getUserProfile();
                setUserData({
                    fullname: data.fullname || data.username || "User",
                    email: data.email || "user@example.com",
                    avatar_url: data.avatar_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s"
                });
            } catch (error) {
                console.error("Failed to fetch user for editor", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!shareTokenParam) return;
        const loadSharedDocument = async () => {
            try {
                const data = await resolveShareToken(shareTokenParam);
                if (data?.document) {
                    setDocument(data.document);
                    setShareToken(shareTokenParam);
                }
            } catch (error) {
                console.error("Failed to resolve share token", error);
            }
        };
        loadSharedDocument();
    }, [shareTokenParam]);

    useEffect(() => {
        if (location.state?.document) {
            setDocument(location.state.document);
        }
    }, [location.state?.document]);

    // Lưu trữ các trạng thái đã qua (trạng thái hiện tại luôn là phần tử cuối cùng)
    const [history, setHistory] = useState([initialContent]);
    // Lưu trữ các trạng thái có thể làm lại (Redo)
    const [future, setFuture] = useState([]);


    //Document handle
    // --- LOGIC DOCUMENT ---
    useEffect(() => {
        if (document) {
            setTitle(document.title || "Untitled Notebook");
            setMarkdown(document.content || "");
            setActiveTags(document.tags || []);
            setIsBookmark(document.isBookmarked || false)
            setPrivacy(document.isPublic ? 'public' : 'private');
            setSaveStatus('saved');
            lastSavedTitleRef.current = document.title || "";
        }
    }, [document]);
    const { handleDocumentUpdate, toggleBookmark } = useDocument();
    const handleRemoteContent = useCallback((content) => {
        setMarkdown(content);
        setHistory([content]);
        setFuture([]);
    }, []);

    const handleCollabError = useCallback(() => {
        setSaveStatus('error');
    }, []);

    const handleStatusChange = useCallback((status) => {
        setSaveStatus(status);
    }, []);

    const { connected, remoteCursors, sendContentUpdate, sendCursorUpdate } = useDocumentCollab({
        docId: document?.id,
        shareToken,
        displayName: isAnonymousShare ? 'Guest' : userData.fullname,
        onRemoteContent: handleRemoteContent,
        onError: handleCollabError,
        onStatusChange: handleStatusChange
    });

    useEffect(() => {
        setIsCollaborativeMode(connected);
    }, [connected]);

    const handleContentChange = useCallback((newMarkdown) => {
        setMarkdown(newMarkdown);
        setSaveStatus('saving');
        if (contentSendTimeoutRef.current) {
            clearTimeout(contentSendTimeoutRef.current);
        }
        contentSendTimeoutRef.current = setTimeout(() => {
            sendContentUpdate(newMarkdown);
        }, 300);

        setHistory(prevHistory => {
            const lastState = prevHistory[prevHistory.length - 1];

            // Chỉ ghi vào lịch sử nếu nội dung thực sự thay đổi
            if (newMarkdown !== lastState) {
                const maxHistory = 50; // Giới hạn lịch sử
                let newHistory = [...prevHistory, newMarkdown];

                if (newHistory.length > maxHistory) {
                    newHistory = newHistory.slice(newHistory.length - maxHistory);
                }

                // Nếu có nội dung mới, không thể Redo được nữa
                setFuture([]);

                return newHistory;
            }
            return prevHistory; // Không thay đổi history
        });

        // Debounced writing suggestion fetching
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        // Only fetch suggestion if enabled and content is long enough and cursor is at end
        const textarea = textareaRef.current;
        const cursorAtEnd = textarea && textarea.selectionStart === newMarkdown.length;

        if (writingSuggestionEnabled && cursorAtEnd && newMarkdown.length > 20) {
            suggestionTimeoutRef.current = setTimeout(async () => {
                setIsFetchingSuggestion(true);
                try {
                    const cursorText = newMarkdown.slice(-100); // Last 100 chars for context
                    const data = await getWritingSuggestion(newMarkdown, cursorText);
                    if (data.suggestion && data.suggestion.trim()) {
                        setWritingSuggestion(data.suggestion);
                    }
                } catch (error) {
                    console.error('Error fetching suggestion:', error);
                } finally {
                    setIsFetchingSuggestion(false);
                }
            }, 500); // 500ms debounce
        }
    }, [sendContentUpdate, writingSuggestionEnabled]);
    // Lưu ý: Các hàm format (toggleFormat, handleListFormat) cần gọi handleContentChange thay vì setMarkdown

    const handleCursorUpdate = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        sendCursorUpdate(textarea.selectionStart, textarea.selectionEnd);
    }, [sendCursorUpdate]);

    const applyLocalChange = useCallback((newText) => {
        handleContentChange(newText);
    }, [handleContentChange]);

    const handleUndo = useCallback(() => {
        if (history.length > 1) {
            // Lấy trạng thái hiện tại
            const currentState = history[history.length - 1];

            // 1. Chuyển trạng thái hiện tại sang mảng future (để có thể Redo)
            setFuture(prevFuture => [currentState, ...prevFuture]);

            // 2. Cập nhật History: Xóa trạng thái hiện tại
            const newHistory = history.slice(0, history.length - 1);
            setHistory(newHistory);

            // 3. Cập nhật nội dung hiển thị
            setMarkdown(newHistory[newHistory.length - 1]);
            setSaveStatus('saving');
            sendContentUpdate(newHistory[newHistory.length - 1]);

            setTimeout(() => { textareaRef.current?.focus(); }, 0);
        }
    }, [history, sendContentUpdate]);

    const handleRedo = useCallback(() => {
        if (future.length > 0) {
            // Lấy trạng thái redo (phần tử đầu tiên của future)
            const nextState = future[0];

            // 1. Chuyển trạng thái redo sang mảng history
            setHistory(prevHistory => [...prevHistory, nextState]);

            // 2. Cập nhật Future: Xóa trạng thái vừa Redo
            setFuture(prevFuture => prevFuture.slice(1));

            // 3. Cập nhật nội dung hiển thị
            setMarkdown(nextState);
            setSaveStatus('saving');
            sendContentUpdate(nextState);

            setTimeout(() => { textareaRef.current?.focus(); }, 0);
        }
    }, [future, sendContentUpdate]);

    const handleSaveTags = async (newTags, newPrivacy) => {
        setActiveTags(newTags);
        setPrivacy(newPrivacy);

        if (isAnonymousShare || !document?.id) {
            setIsTagEditorOpen(false);
            return;
        }

        setSaveStatus('saving');
        try {
            await handleDocumentUpdate(document.id, {
                title,
                tags: newTags,
                isPublic: newPrivacy === 'public'
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error("Tag update failed", error);
            setSaveStatus('error');
        }

        setIsTagEditorOpen(false);
    };

    const handleTitleSave = async () => {
        if (!document?.id || isAnonymousShare) return;
        if (title === lastSavedTitleRef.current) return;
        setSaveStatus('saving');
        try {
            await handleDocumentUpdate(document.id, { title });
            lastSavedTitleRef.current = title;
            setSaveStatus('saved');
        } catch (error) {
            console.error("Title update failed", error);
            setSaveStatus('error');
        }
    };

    const getCaretCoordinates = useCallback((textarea, position) => {
        if (!textarea) return null;
        const div = window.document.createElement('div');
        const style = window.getComputedStyle(textarea);
        const properties = [
            'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
            'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
            'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
            'textAlign', 'textTransform', 'textIndent', 'textDecoration',
            'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
        ];
        properties.forEach((prop) => {
            div.style[prop] = style[prop];
        });
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.top = '0px';
        div.style.left = '-9999px';
        div.textContent = textarea.value.substring(0, position);
        const span = window.document.createElement('span');
        span.textContent = textarea.value.substring(position) || '.';
        div.appendChild(span);
        window.document.body.appendChild(div);
        const coords = {
            left: span.offsetLeft - textarea.scrollLeft,
            top: span.offsetTop - textarea.scrollTop,
            height: span.offsetHeight
        };
        window.document.body.removeChild(div);
        return coords;
    }, []);

    const renderRemoteCursors = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return null;
        void scrollTick;
        return remoteCursors.map((cursor) => {
            const coords = getCaretCoordinates(textarea, cursor.selectionStart || 0);
            if (!coords) return null;
            const color = cursor.user?.color || '#22c55e';
            const name = cursor.user?.name || 'User';
            const left = textarea.offsetLeft + coords.left;
            const top = textarea.offsetTop + coords.top;
            return (
                <div
                    key={cursor.user?.clientId || `${left}-${top}`}
                    className="absolute pointer-events-none"
                    style={{ left, top }}
                >
                    <div className="w-0.5" style={{ height: coords.height, backgroundColor: color }} />
                    <div className="px-1 py-0.5 text-[10px] text-white rounded mt-0.5" style={{ backgroundColor: color }}>
                        {name}
                    </div>
                </div>
            );
        });
    }, [remoteCursors, scrollTick, getCaretCoordinates]);

    const handleOpenAIModal = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value.substring(start, end);

            if (text.trim()) {
                setAiMode('refine');
                setSelectedTextForAI(text);
                setSelectionRange({ start, end });
            } else {
                setAiMode('generate');
                setSelectedTextForAI('');
                setSelectionRange(null);
            }
        }
        setIsAIModalOpen(true);
    };

    // Tag Management Handlers
    const handleOpenTagPanel = () => {
        setIsSettingsPanelOpen(true);
        setAiSuggestedTags([]); // Reset suggestions when opening
    };

    const handleAISuggestTags = async () => {
        setIsLoadingSuggestions(true);
        try {
            const result = await suggestTags(markdown);
            setAiSuggestedTags(result.tags || []);
        } catch (error) {
            console.error('Failed to get AI tag suggestions:', error);
            setAiSuggestedTags([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleSaveTagsFromPanel = async (newTags, newPrivacy) => {
        setActiveTags(newTags);
        setPrivacy(newPrivacy);

        if (isAnonymousShare || !document?.id) {
            setIsSettingsPanelOpen(false);
            return;
        }

        setSaveStatus('saving');
        try {
            await handleDocumentUpdate(document.id, {
                title,
                tags: newTags,
                isPublic: newPrivacy === 'public'
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error("Manual tag save failed", error);
            setSaveStatus('error');
        }

        setIsSettingsPanelOpen(false);
    };

    const handleMouseUp = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Stop resizing logic if any
        if (isResizing) stopResizing();

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start !== end) {
            // Calculate position relative to viewport
            // We want it above the selection.
            // Since we only have mouse coordinates, we use those.
            setQuickRefinePos({ x: e.clientX, y: e.clientY });
        } else {
            setQuickRefinePos(null);
        }
        handleCursorUpdate();
    };

    const handleQuickRefine = async () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value.substring(start, end);

        if (!text.trim()) return;

        setQuickRefinePos(null);
        success("Refining text...");

        try {
            const docId = document?.id || null;
            const data = await refineContent(docId, text, "Refine this text to be more professional, clear, and concise.");

            if (data && data.content) {
                const before = markdown.substring(0, start);
                const after = markdown.substring(end);
                // Using the mark syntax as per existing pattern
                const newText = before + `\n:::mark\n${data.content}\n:::\n` + after;

                applyLocalChange(newText);
            }
        } catch (error) {
            console.error("Quick refine error:", error);
        }
    };

    const handleAIGenerate = async (type, prompt) => {
        console.log("handleAIGenerate called with:", type, prompt);
        try {
            let data;
            if (aiMode === 'refine' && selectedTextForAI) {
                // Pass document.id if available
                const docId = document?.id || null;
                data = await refineContent(docId, selectedTextForAI, prompt);
            } else {
                data = await generateContent(type, prompt);
            }

            console.log("AI Generated Data:", data);

            if (data && data.content) {
                let newText = markdown;

                if (aiMode === 'refine' && selectionRange) {
                    const before = markdown.substring(0, selectionRange.start);
                    const after = markdown.substring(selectionRange.end);
                    newText = before + `\n:::mark\n${data.content}\n:::\n` + after;
                } else {
                    // Generate mode: Append to end
                    newText = markdown + '\n\n' + data.content;
                }

                applyLocalChange(newText);
                success("Content generated successfully!");
            } else {
                console.warn("No content in response data");
            }
        } catch (error) {
            console.error("handleAIGenerate error:", error);
            // Error handling is done in AIModal or Service
        }
    };


    // --- LOGIC BOOKMARK ---
    const toggleBookmarkSection = async () => {
        if (!document?.id || isAnonymousShare) return;

        // Optimistic UI update
        const newStatus = !isBookmark;
        setIsBookmark(newStatus);

        try {
            await toggleBookmark(document.id);
            if (newStatus) success("Bookmark successfully");
            else success("Unbookmark successfully");
        } catch (error) {
            // Revert on error
            setIsBookmark(!newStatus);
            console.error("Failed to toggle bookmark", error);
        }
    }

    // --- LOGIC EDITOR ---
    const toggleFormat = (symbol) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = markdown.substring(0, start);
        const selected = markdown.substring(start, end);
        const after = markdown.substring(end);
        const newText = `${before}${symbol}${selected}${symbol}${after}`;
        applyLocalChange(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + symbol.length, end + symbol.length);
        }, 0);
    };
    const handleKeyDown = (e) => {
        // Keyboard shortcuts for formatting
        if (e.ctrlKey || e.metaKey) {
            // Ctrl + B: Bold
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                toggleFormat('**');
                return;
            }
            // Ctrl + I: Italic
            if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                toggleFormat('_');
                return;
            }
            // Ctrl + Shift + S: Strikethrough
            if (e.shiftKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                toggleFormat('~~');
                return;
            }
        }

        // Handle Tab key for accepting writing suggestion
        if (e.key === 'Tab' && writingSuggestion) {
            e.preventDefault();
            const newText = markdown + writingSuggestion;
            applyLocalChange(newText);
            setWritingSuggestion('');

            // Move cursor to end
            setTimeout(() => {
                const textarea = textareaRef.current;
                if (textarea) {
                    textarea.setSelectionRange(newText.length, newText.length);
                    textarea.focus();
                }
            }, 0);
            return;
        }

        // Handle Escape key to dismiss suggestion
        if (e.key === 'Escape' && writingSuggestion) {
            setWritingSuggestion('');
            return;
        }

        if (e.key === 'Enter') {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Lấy dòng hiện tại
            const value = textarea.value;
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = value.indexOf('\n', start);
            const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);

            // Regex nhận diện List
            // Group 1: Khoảng trắng đầu dòng (indent)
            // Group 2: Ký hiệu (*, -, 1., - [ ])
            const listRegex = /^(\s*)(\*|-|\d+\.|- \[[ x]\])\s+(.*)$/;
            const match = currentLine.match(listRegex);

            if (match) {
                e.preventDefault(); // Ngăn hành vi xuống dòng mặc định

                const indent = match[1];
                const symbol = match[2];
                const content = match[3];

                // TRƯỜNG HỢP 1: Dòng hiện tại RỖNG -> Thoát khỏi List
                if (content.trim() === '') {
                    // Xóa ký hiệu list ở dòng hiện tại
                    const newValue = value.substring(0, lineStart) + indent + value.substring(end);
                    applyLocalChange(newValue);

                    // Đặt con trỏ về đầu dòng (sau indent)
                    setTimeout(() => {
                        textarea.setSelectionRange(lineStart + indent.length, lineStart + indent.length);
                    }, 0);
                    return;
                }

                // TRƯỜNG HỢP 2: Dòng có nội dung -> Tạo dòng mới với ký hiệu tiếp theo
                let nextSymbol = symbol;

                // Nếu là số (1., 2.), tự động tăng
                if (/^\d+\.$/.test(symbol)) {
                    const num = parseInt(symbol);
                    nextSymbol = `${num + 1}.`;
                }
                // Nếu là checklist (- [x]), dòng mới luôn là chưa check (- [ ])
                else if (symbol === '- [x]') {
                    nextSymbol = '- [ ]';
                }

                const insertText = `\n${indent}${nextSymbol} `;
                const newValue = value.substring(0, start) + insertText + value.substring(end);

                applyLocalChange(newValue);

                // Đặt con trỏ sau ký hiệu mới
                setTimeout(() => {
                    const newCursorPos = start + insertText.length;
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
            }
        }
    };

    const handleListFormat = (symbol) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;

        // --- Bổ sung: Xử lý trường hợp con trỏ nằm ở đầu dòng trống ---
        // Tìm vị trí bắt đầu dòng hiện tại
        let lineStart = start;
        while (lineStart > 0 && markdown[lineStart - 1] !== '\n') {
            lineStart--;
        }

        // Kiểm tra nếu con trỏ ở đầu dòng VÀ dòng đó trống (hoặc chỉ có khoảng trắng)
        const lineContent = markdown.substring(lineStart, end).trim();
        if (start === end && lineContent === '') {

            let newSymbol = symbol;
            if (symbol === '1.') {
                // Khi dòng trống, ta mặc định thêm 1. và người dùng sẽ sửa lại khi cần
                newSymbol = '1.';
            }
            const insertText = `${newSymbol} `; // Thêm ký hiệu list và khoảng trắng

            const newText = `${markdown.substring(0, start)}${insertText}${markdown.substring(end)}`;

            applyLocalChange(newText);

            // Đặt con trỏ sau ký hiệu list đã chèn
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + insertText.length, start + insertText.length);
            }, 0);

            return; // Thoát khỏi hàm để không chạy logic xử lý dòng phức tạp bên dưới
        }
        // -------------------------------------------------------------------


        // 1. Mở rộng vùng chọn ra toàn bộ dòng (Logic cũ vẫn cần cho trường hợp Toggle)
        while (start > 0 && markdown[start - 1] !== '\n') start--;
        while (end < markdown.length && markdown[end] !== '\n') end++;

        const before = markdown.substring(0, start);
        const selected = markdown.substring(start, end);
        const after = markdown.substring(end);

        const lines = selected.split('\n');

        // Regex để nhận diện các loại list (giữ nguyên)
        const listRegex = /^(\s*)(\*|-|\d+\.|- \[[ x]\])\s+/;
        const isOrderedList = symbol === '1.';

        // Kiểm tra xem TẤT CẢ các dòng đã có đúng format chưa để quyết định toggle (giữ nguyên)
        const allHaveSymbol = lines.every(line => {
            if (line.trim() === '') return true;
            const match = line.match(listRegex);
            if (!match) return false;

            if (isOrderedList) return /^\d+\./.test(match[2]);
            return match[2].startsWith(symbol.trim());
        });

        // Hàm phụ để luôn lấy ra (indentation + content) (giữ nguyên)
        const getCleanLineParts = (line) => {
            const indentMatch = line.match(/^\s*/);
            const indentation = indentMatch ? indentMatch[0] : '';
            const remaining = line.substring(indentation.length);
            const listMatch = remaining.match(listRegex);

            let contentToUse = remaining;

            if (listMatch) {
                contentToUse = remaining.substring(listMatch[0].length);
            }
            return { indentation, contentToUse: contentToUse.trim() };
        }

        const newLines = lines.map((line, index) => {
            if (line.trim() === '') return line;

            const { indentation, contentToUse } = getCleanLineParts(line);

            if (allHaveSymbol) {
                // -- XÓA LIST (Un-list) --
                return `${indentation}${contentToUse}`;
            } else {
                // -- THÊM LIST --
                let newSymbol = symbol;

                if (isOrderedList) {
                    newSymbol = `${index + 1}.`;
                }

                return `${indentation}${newSymbol} ${contentToUse}`;
            }
        });

        const newSelected = newLines.join('\n');
        const newText = `${before}${newSelected}${after}`;

        applyLocalChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + newSelected.length);
        }, 0);
    };
    // Bạn nên lưu vị trí con trỏ hiện tại vào một ref mỗi khi mở popup (Optional but recommended)
    // Nhưng cách đơn giản nhất là lấy vị trí hiện tại khi bấm Insert

    const insertTable = () => {
        // Mặc định tạo bảng 3x3
        const rows = 3;
        const cols = 3;

        let headerRow = "|";
        let separatorRow = "|";
        for (let c = 0; c < cols; c++) {
            headerRow += ` Header ${c + 1} |`;
            separatorRow += " --- |";
        }

        let bodyRows = "";
        for (let r = 0; r < rows; r++) {
            bodyRows += "\n|";
            for (let c = 0; c < cols; c++) {
                bodyRows += ` R${r + 1}C${c + 1} |`;
            }
        }

        const tableMarkdown = `\n${headerRow}\n${separatorRow}${bodyRows}\n`;

        // Chèn vào editor
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = markdown.substring(0, start) + tableMarkdown + markdown.substring(end);

        applyLocalChange(newText);


        setTimeout(() => {
            textarea.focus();
            const newCursor = start + tableMarkdown.length;
            textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
    };


    const handleEditorClick = (e) => {
        const textarea = e.target;
        const cursor = textarea.selectionStart;
        const text = textarea.value;

        // If text is selected, do not process click events for markers
        if (textarea.selectionStart !== textarea.selectionEnd) return;

        // Find all highlight matches using directive syntax
        // Matches :::mark [content] :::
        const regex = /:::mark\s+([\s\S]*?)\s+:::/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            // Check if cursor is inside the block
            if (cursor >= start && cursor <= end) {
                // Remove the markers
                const content = match[1];
                const newText = text.substring(0, start) + content + text.substring(end);

                applyLocalChange(newText);

                // Adjust cursor
                // We removed ":::mark\n" (approx 8 chars) from the start
                // But we need to be precise.
                // The regex match[0] is the whole block.
                // match[1] is the content.
                // The start marker length is (start of content) - (start of match)
                const startMarkerLength = text.indexOf(content, start) - start;

                let newCursor = cursor;
                if (cursor > start + startMarkerLength) {
                    newCursor -= startMarkerLength;
                } else if (cursor > start) {
                    newCursor = start;
                }

                // We need to set selection range after render
                setTimeout(() => {
                    textarea.setSelectionRange(newCursor, newCursor);
                    textarea.focus();
                }, 0);

                return; // Handle one click at a time
            }
        }
    };

    const handleFormat = (type) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = markdown.substring(0, start);
        // Lấy văn bản được chọn và loại bỏ khoảng trắng thừa ở hai đầu
        let selected = markdown.substring(start, end).trim();
        const after = markdown.substring(end);
        let newText;
        let newCursorPosition = null;

        if (type === 'img') {
            // --- Xử lý Chèn Ảnh ---
            const altTextPlaceholder = 'Alt text';
            const urlPlaceholder = 'đường_dẫn_ảnh';
            const titlePlaceholder = '"Optional title"';

            if (selected) {
                // Trường hợp 1: Người dùng bôi đen link ảnh
                const imageSyntax = `![${altTextPlaceholder}](${selected} ${titlePlaceholder})`;
                newText = `${before}${imageSyntax}${after}`;

                // Đặt con trỏ để bôi đen/chọn "Alt text"
                const altTextStart = before.length + 2;
                const altTextEnd = altTextStart + altTextPlaceholder.length;
                newCursorPosition = { start: altTextStart, end: altTextEnd };

            } else {
                // Trường hợp 2: Người dùng nhấn nút, chèn cú pháp mẫu
                const imageSyntax = `![${altTextPlaceholder}](${urlPlaceholder} ${titlePlaceholder})`;
                newText = `${before}${imageSyntax}${after}`;

                // Đặt con trỏ để bôi đen/chọn "đường_dẫn_ảnh"
                const linkStart = before.length + `![${altTextPlaceholder}](`.length;
                const linkEnd = linkStart + urlPlaceholder.length;
                newCursorPosition = { start: linkStart, end: linkEnd };
            }

        } else if (type === 'code') {
            // --- Xử lý Chèn Block Code ---
            const codeSyntaxDelimiter = '```';
            const languagePlaceholder = 'ngôn_ngữ';

            if (selected) {
                // Trường hợp 3: Người dùng bôi đen code
                // Cú pháp: ```ngôn_ngữ\nselected_code\n```
                const codeSyntax = `${codeSyntaxDelimiter}${languagePlaceholder}\n${selected}\n${codeSyntaxDelimiter}`;
                newText = `${before}${codeSyntax}${after}`;

                // Đặt con trỏ để bôi đen/chọn "ngôn_ngữ"
                const langStart = before.length + codeSyntaxDelimiter.length;
                const langEnd = langStart + languagePlaceholder.length;
                newCursorPosition = { start: langStart, end: langEnd };
            } else {
                // Trường hợp 4: Người dùng nhấn nút Code, chèn block mẫu
                const codePlaceholder = '\n// Viết code của bạn ở đây\n';
                const codeSyntax = `${codeSyntaxDelimiter}${languagePlaceholder}${codePlaceholder}${codeSyntaxDelimiter}`;
                newText = `${before}${codeSyntax}${after}`;

                // Đặt con trỏ vào vị trí code để người dùng bắt đầu viết
                const codeStart = before.length + codeSyntaxDelimiter.length + languagePlaceholder.length + 1;
                const codeEnd = codeStart + codePlaceholder.length - 2; // -2 bỏ qua 2 kí tự xuống dòng ở đầu và cuối
                newCursorPosition = { start: codeStart, end: codeStart }; // Chỉ đặt con trỏ ở đầu block code
            }
        } else if (type == 'link') {

            // --- Xử lý Chèn Link ---
            const textPlaceholder = 'Tên_Link';
            const urlPlaceholder = 'đường_dẫn_URL';

            if (selected) {
                // Trường hợp 1: Người dùng bôi đen Text/Tên Link
                const linkSyntax = `[${selected}](${urlPlaceholder} "Optional title")`;
                newText = `${before}${linkSyntax}${after}`;

                // Đặt con trỏ để bôi đen/chọn "đường_dẫn_URL"
                const urlStart = before.length + `[${selected}](`.length;
                const urlEnd = urlStart + urlPlaceholder.length;
                newCursorPosition = { start: urlStart, end: urlEnd };
            } else {
                // Trường hợp 2: Người dùng nhấn nút, chèn cú pháp mẫu
                const linkSyntax = `[${textPlaceholder}](${urlPlaceholder} "Optional title")`;
                newText = `${before}${linkSyntax}${after}`;

                // Đặt con trỏ để bôi đen/chọn "Tên_Link"
                const textStart = before.length + 1; // Sau dấu '['
                const textEnd = textStart + textPlaceholder.length;
                newCursorPosition = { start: textStart, end: textEnd };
            }

        } else if (type === 'table') {
            // --- Xử lý Chèn Bảng (Table) ---
            const tableSyntax = `\n| Cột 1 | Cột 2 | Cột 3 |\n|---|---|---|\n| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 |\n| Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 |\n`;
            newText = `${before}${tableSyntax}${after}`;

            // Đặt con trỏ vào đầu bảng
            const cursorStart = before.length + 1;
            newCursorPosition = { start: cursorStart, end: cursorStart };
        } else {
            return; // Không xử lý định dạng không xác định
        }

        applyLocalChange(newText);

        // Điều chỉnh vị trí con trỏ
        setTimeout(() => {
            textarea.focus();
            if (newCursorPosition) {
                textarea.setSelectionRange(newCursorPosition.start, newCursorPosition.end || newCursorPosition.start);
            } else {
                // Nếu không có vị trí cụ thể, đặt con trỏ ở cuối phần được chèn
                textarea.setSelectionRange(before.length + newText.length, before.length + newText.length);
            }
        }, 0);
    };

    const handleToolClick = (toolName) => {
        setSelectedTools(prev => prev.includes(toolName) ? prev.filter(t => t !== toolName) : [...prev, toolName]);
    };



    // --- LOGIC COMMENT ---
    const toggleCommentSection = () => {
        if (!showComments) {
            setIsTagEditorOpen(false);
        }
        setShowComments(!showComments);
    }

    const handlePostComment = () => {
        if (!newCommentText.trim()) {
            alert("Comment cannot be empty!");
            return;
        }
        const newComment = {
            id: Date.now(),
            user: "You",
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s",
            content: newCommentText,
            time: "Just now"
        };
        setComments([...comments, newComment]);
        setNewCommentText("");
        setIsInputActive(false);
    };

    const handleCancelComment = () => {
        setNewCommentText("");
        setIsInputActive(false);
    };

    // --- LOGIC RESIZE ---
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e) => {
        if (isResizing && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newRatio > 20 && newRatio < 80) setEditorRatio(newRatio);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const renderToolbarBtn = (Icon, toolName, action) => (
        <ToolbarBtn
            icon={Icon}
            isActive={(toolName === 'comment' ? showComments : selectedTools.includes(toolName)) ||
                ((toolName == 'bookmark' && isBookmark) ? true : false)}
            onClick={action ? action : () => handleToolClick(toolName)}
        />
    );

    return (
        <main className="flex flex-col h-screen text-gray-300 font-sans overflow-hidden bg-[rgb(6,4,36)] text-white relative">

            {/* HEADER */}
            <header className="flex h-16 shrink-0 border-b border-white/10 px-4 justify-between items-center z-20 bg-[rgb(6,4,36)]">
                <div className="flex items-center gap-6">
                    <Link to="/home/myworkspace" className="contents">
                        <img src='/logo_small.png' className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" alt="Logo" />
                    </Link>
                    <div className="flex items-center gap-2 group">
                        <input className="bg-transparent text-sm sm:text-lg font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-2 py-1 w-24 md:w-48 transition-all placeholder:text-gray-600"
                            type="text" placeholder="Untitled Notebook"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (!isAnonymousShare) {
                                    setSaveStatus('unsaved');
                                }
                            }}
                            onBlur={handleTitleSave}
                            readOnly={isAnonymousShare} />
                        <Edit2 size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Save Status Indicator */}
                    <div className="flex items-center space-x-2 text-xs ml-0 select-none">
                        {saveStatus === 'saved' && (
                            <div className="flex items-center text-green-500 opacity-60">
                                <Cloud size={14} className="mr-1" />
                                <span className="hidden sm:inline">Saved</span>
                            </div>
                        )}
                        {saveStatus === 'saving' && (
                            <div className="flex items-center text-blue-400">
                                <Loader size={14} className="mr-1 animate-spin" />
                                <span className="hidden sm:inline">Saving...</span>
                            </div>
                        )}
                        {saveStatus === 'unsaved' && (
                            <div className="flex items-center text-yellow-500">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                                <span className="hidden sm:inline">Unsaved changes</span>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center text-red-500" title="Check your internet connection">
                                <CloudOff size={14} className="mr-1" />
                                <span className="hidden sm:inline">Save failed</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-white/5 relative">
                        <div onClick={() => setIsViewMenuOpen(!isViewMenuOpen)} className="contents ">
                            <ToolbarBtn
                                icon={
                                    viewMode === 'editor' ? Pencil :
                                        viewMode === 'preview' ? Eye : Columns2
                                }
                                isActive={isViewMenuOpen}

                            >
                            </ToolbarBtn>
                            {/* {viewMode === 'editor' ? 'Editor' : viewMode === 'preview' ? 'Preview' : 'Side-by-side'} */}
                        </div>


                        {isViewMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-40 bg-[#1e1f22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    <button
                                        onClick={() => { setViewMode('editor'); setIsViewMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${viewMode === 'editor' ? 'text-blue-400' : 'text-gray-300'}`}
                                    >
                                        <Pencil size={14} />
                                        <span>Editor only</span>
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('preview'); setIsViewMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${viewMode === 'preview' ? 'text-blue-400' : 'text-gray-300'}`}
                                    >
                                        <Eye size={14} />
                                        <span>Render view</span>
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('side-by-side'); setIsViewMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${viewMode === 'side-by-side' ? 'text-blue-400' : 'text-gray-300'}`}
                                    >
                                        <Columns2 size={14} />
                                        <span>Side-by-side</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {renderToolbarBtn(Bookmark, 'bookmark', toggleBookmarkSection)}


                        {renderToolbarBtn(MessageSquareText, 'comment', toggleCommentSection)}
                        {comments.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse pointer-events-none"></span>}
                    </div>
                    <div className="relative">
                        <ToolbarBtn icon={Tag} onClick={handleOpenTagPanel} />
                        {activeTags.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">{activeTags.length}</span>}
                    </div>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        disabled={isAnonymousShare}
                        className={`flex items-center py-1.5 px-5 rounded-lg bg-blue-600 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-900/20 ${isAnonymousShare ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                    >
                        Share
                    </button>
                    <div className="relative">
                        <div onClick={() => setIsOpen(!isOpen)} className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                            <img className="w-full h-full object-cover" src={userData.avatar_url} alt="User" />
                        </div>
                        {isOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm text-white font-medium">{userData.fullname}</p>
                                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                                </div>
                                <ul className="py-1 text-sm text-gray-400">
                                    <li><Link to="/home/myworkspace" className="block px-4 py-2 hover:bg-white/5 hover:text-white">My workspace</Link></li>
                                    <li><Link to="/home/setting" className="block px-4 py-2 hover:bg-white/5 hover:text-white">Settings</Link></li>
                                    <li><Link to="#" className="block px-4 py-2 hover:bg-white/5 text-red-400 hover:text-red-300">Sign out</Link></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN AREA */}
            <div className="flex flex-1 overflow-hidden relative" ref={containerRef}>

                {/* 1. Left: Editor */}
                <div
                    className={`flex flex-col border-r border-white/10 ${viewMode === 'preview' ? 'hidden' : 'flex'}`}
                    style={{
                        // Nếu mode là editor -> width 100%, side-by-side -> theo ratio
                        width: viewMode === 'editor' ? '100%' : `${editorRatio}%`
                    }}
                >
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 sticky top-0 z-10 overflow-x-auto no-scrollbar bg-[#0f1011]">
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={Undo2} onClick={handleUndo}
                                // Disable nếu chỉ còn trạng thái khởi tạo
                                disabled={history.length <= 1} />
                            <ToolbarBtn icon={Redo2} onClick={handleRedo}
                                // Disable nếu không có trạng thái nào trong future
                                disabled={future.length === 0} />
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Bold, 'bold', () => toggleFormat('**'))}
                            {renderToolbarBtn(Italic, 'italic', () => toggleFormat('_'))}
                            {renderToolbarBtn(Strikethrough, 'strikethrough', () => toggleFormat('~~'))}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Code, 'code', () => handleFormat('code'))}
                            {renderToolbarBtn(List, 'ul', () => handleListFormat('*'))}           {/* SỬ DỤNG HÀM MỚI */}
                            {renderToolbarBtn(ListOrdered, 'ol', () => handleListFormat('1.'))}   {/* SỬ DỤNG HÀM MỚI */}
                            {renderToolbarBtn(SquareCheck, 'check', () => handleListFormat('- [ ]'))}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(ImageIcon, 'img', () => handleFormat('img'))}
                            {renderToolbarBtn(LinkIcon, 'link', () => handleFormat('link'))}
                            {renderToolbarBtn(TableIcon, 'table', insertTable)}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={Sparkles} onClick={handleOpenAIModal} />
                        </div>
                    </div>
                    <div className="flex bg-[#121315] flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            className="flex-1 w-full h-full  bg-transparent p-6 text-gray-300 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar"
                            placeholder="# Start writing..." value={markdown}
                            onChange={(e) => handleContentChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleCursorUpdate}
                            onClick={handleEditorClick}
                            onMouseUp={handleMouseUp}
                            onSelect={handleCursorUpdate}
                            onScroll={() => setScrollTick((prev) => prev + 1)}
                        />
                        {remoteCursors.length > 0 && (
                            <div className="absolute inset-0 pointer-events-none">
                                {renderRemoteCursors()}
                            </div>
                        )}
                        {quickRefinePos && (
                            <div
                                className="fixed z-50 flex items-center gap-2 bg-gray-800 border border-gray-700 shadow-xl rounded-lg p-1 animate-in fade-in zoom-in-95 duration-200"
                                style={{
                                    top: quickRefinePos.y - 50,
                                    left: quickRefinePos.x - 20
                                }}
                            >
                                <button
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur
                                    onClick={handleQuickRefine}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                                >
                                    <Sparkles size={14} />
                                    Refine
                                </button>
                            </div>
                        )}
                        {/* Writing Suggestion - Inline Ghost Text (Single User Mode) */}
                        {writingSuggestion && !isCollaborativeMode && (
                            <div
                                className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none p-6 font-mono text-sm leading-relaxed overflow-hidden"
                                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                            >
                                {/* Invisible text to match position */}
                                <span className="invisible">{markdown}</span>
                                {/* Ghost suggestion text */}
                                <span className="text-gray-500/50 italic">{writingSuggestion}</span>
                                {/* Tab hint */}
                                <span className="ml-2 text-xs text-gray-600 bg-gray-800/50 px-1 py-0.5 rounded border border-gray-700">
                                    Tab ↵
                                </span>
                            </div>
                        )}
                        {/* Writing Suggestion - Bottom Bar (Collaborative Mode) */}
                        {writingSuggestion && isCollaborativeMode && (
                            <div className="absolute bottom-4 left-6 right-6 pointer-events-none">
                                <div className="flex items-center gap-2 bg-gray-800/90 border border-gray-700 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <Sparkles size={14} className="text-blue-400 shrink-0" />
                                    <span className="text-gray-400/80 text-sm font-mono truncate">
                                        {writingSuggestion.length > 100 ? writingSuggestion.substring(0, 100) + '...' : writingSuggestion}
                                    </span>
                                    <div className="flex items-center gap-2 ml-auto shrink-0">
                                        <kbd className="px-2 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">Tab</kbd>
                                        <span className="text-xs text-gray-500">to accept</span>
                                        <kbd className="px-2 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">Esc</kbd>
                                        <span className="text-xs text-gray-500">to dismiss</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Loading indicator for suggestion */}
                        {isFetchingSuggestion && (
                            <div className="absolute bottom-4 right-8">
                                <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1.5">
                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs text-gray-400">AI thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Resizer */}
                <div onMouseDown={startResizing} className={`bg-gray-900 w-1.5 cursor-col-resize z-30 flex items-center justify-center border-l border-r border-white/5 ${isResizing ? 'bg-blue-600' : ''}`}>
                    <GripVertical size={10} className="text-gray-500" />
                </div>



                {/* 3. Right: Preview */}
                <div
                    className={`flex flex-col bg-[#121315] ${viewMode === 'editor' ? 'hidden' : 'flex'}`}
                    style={{
                        // Nếu mode là preview -> width 100%, side-by-side -> phần còn lại
                        width: viewMode === 'preview' ? '100%' : `${100 - editorRatio}%`
                    }}
                >
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0f1011]">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Preview</span>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none bg-[#0f1011] custom-scrollbar">
                        <Markdown remarkPlugins={[remarkDirective, remarkGfm, remarkHighlightPlugin]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>{markdown}</Markdown>
                    </div>
                </div>



                {/* --- COMMENT PANEL --- */}
                {/* Đã sửa z-index lên 9999 để không bị che bởi bất cứ thứ gì */}
                {showComments && (
                    <div className="absolute top-4 right-6 w-80 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl z-[9999] flex flex-col max-h-[calc(100%-2rem)] animate-in fade-in slide-in-from-right-4 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#1e1f22] rounded-t-xl">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <MessageSquareText size={16} />
                                <span>Comments</span>
                                <span className="bg-blue-600 text-xs px-1.5 py-0.5 rounded-full">{comments.length}</span>
                            </div>
                            <button onClick={() => setShowComments(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {comments.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm mt-4">No comments yet.</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-700 flex items-center justify-center">
                                            {c.avatar ? <img src={c.avatar} className="w-full h-full object-cover" alt={c.user} /> : <User size={16} className="text-gray-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-[#2b2d31] p-3 rounded-lg rounded-tl-none border border-white/5">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-semibold text-sm text-gray-200">{c.user}</span>
                                                    <span className="text-xs text-gray-500">{c.time}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-relaxed break-words">{c.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#1e1f22] border-t border-white/5 rounded-b-xl">
                            {!isInputActive ? (
                                <button
                                    onClick={() => setIsInputActive(true)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm w-full p-2 rounded-lg hover:bg-white/5 group"
                                >
                                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors">
                                        <span className="text-lg leading-none mb-0.5">+</span>
                                    </div>
                                    <span>Add comment</span>
                                </button>
                            ) : (
                                <div className="bg-[#2b2d31] p-3 rounded-xl border border-blue-500/50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-blue-900">
                                            <img src="[https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s)" className="w-full h-full object-cover" alt="You" />
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">Commenting as You</span>
                                    </div>
                                    <textarea
                                        autoFocus
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none min-h-[60px]"
                                        placeholder="Type your thoughts..."

                                    />
                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                                        <button onClick={handleCancelComment} className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">Cancel</button>
                                        <button onClick={handlePostComment} className="text-xs font-medium bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Comment</button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    documentTitle={title}
                    documentId={document?.id}
                />
                <SettingsPanel
                    isOpen={isSettingsPanelOpen}
                    onClose={() => setIsSettingsPanelOpen(false)}
                    tags={activeTags}
                    privacy={privacy}
                    onSave={handleSaveTagsFromPanel}
                    availableTags={availableTags}
                    aiSuggestedTags={aiSuggestedTags}
                    onAISuggest={handleAISuggestTags}
                    isLoadingSuggestions={isLoadingSuggestions}
                />
                <AIModal
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    onGenerate={handleAIGenerate}
                    mode={aiMode}
                    selectedText={selectedTextForAI}
                />
                {isResizing && <div className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent" />}
            </div>
        </main>
    );
}
