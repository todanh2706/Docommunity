import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { TagEditorModal } from '../components/Layout/Modal'
import { Link, useLocation } from "react-router-dom";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import {
    Edit2, Bookmark, Tag, MessageSquareText, Columns2,
    Undo2, Redo2, Bold, Italic, Underline, Code, Table as TableIcon,
    List, Link as LinkIcon, Image as ImageIcon, Strikethrough, ListOrdered, SquareCheck,
    GripVertical, X, User // Đảm bảo đã import User và X
} from "lucide-react";

// --- COMPONENTS CON ---
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

export default function EditorPage() {
    // --- 1. KHAI BÁO STATE (QUAN TRỌNG: PHẢI CÓ ĐỦ Ở ĐÂY) ---
    // Khởi tạo state với giá trị mặc định (rỗng hoặc giá trị từ document nếu có)
    const location = useLocation();
    const document = location.state?.document;
    const [title, setTitle] = useState(document?.title || "");
    const [markdown, setMarkdown] = useState(document?.content || "");
    const [activeTags, setActiveTags] = useState(document?.tags || []); // Sử dụng tags từ document
 
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

    //Toasts
    const { success } = useToast();
    const [isBookmark, setIsBookmark] = useState(true)


    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);


    // --- MỚI: Hàm lưu tags từ modal ---
    const handleOpenTagEditor = () => {
        setIsTagEditorOpen(true);
    }

    const handleSaveTags = (newTags) => {
        setActiveTags(newTags); // Cập nhật state activeTags (hiển thị trên UI)

        // Ở đây bạn sẽ gọi API để lưu vào DB: updateDocTags(card.id, newTags)
        // Bạn có thể thêm console.log('Tags updated to API:', newTags);

        setIsTagEditorOpen(false); // Đóng modal sau khi lưu
    };


    // --- LOGIC BOOKMARK ---
    const toggleBookmarkSection = () => {
        if (isBookmark == true)
            success("Bookmark successfully")
        else
            success("unbookmark successfully")
        setIsBookmark(!isBookmark)

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
        setMarkdown(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + symbol.length, end + symbol.length);
        }, 0);
    };

    const handleToolClick = (toolName) => {
        setSelectedTools(prev => prev.includes(toolName) ? prev.filter(t => t !== toolName) : [...prev, toolName]);
    };
    // --- LOGIC DOCUMENT ---
    useEffect(() => {
        if (document) {
            setTitle(document.title || "Untitled Notebook");
            setMarkdown(document.content || "");
            setActiveTags(document.tags || []);
            // ... (các state khác)
        }
    }, [document]);


    // --- LOGIC COMMENT ---
    const toggleCommentSection = () => setShowComments(!showComments);



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
                ((toolName == 'bookmark' && !isBookmark) ? true : false)}
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
                                onChange={(e) => setTitle(e.target.value)} />
                        <Edit2 size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-white/5 relative">
                        <ToolbarBtn icon={Columns2} />

                        {renderToolbarBtn(Bookmark, 'bookmark', toggleBookmarkSection)}
                        {renderToolbarBtn(Tag, 'tag', handleOpenTagEditor)}

                        {renderToolbarBtn(MessageSquareText, 'comment', toggleCommentSection)}
                        {comments.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse pointer-events-none"></span>}
                    </div>
                    <button className="flex items-center py-1.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-900/20">Share</button>
                    <div className="relative">
                        <div onClick={() => setIsOpen(!isOpen)} className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                            <img className="w-full h-full object-cover" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s" alt="User" />
                        </div>
                        {isOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm text-white font-medium">Bonnie Green</p>
                                    <p className="text-xs text-gray-500 truncate">name@flowbite.com</p>
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
                <div className="flex flex-col border-r border-white/10" style={{ width: `${editorRatio}%` }}>
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 sticky top-0 z-10 overflow-x-auto no-scrollbar bg-[#0f1011]">
                        <div className="flex items-center gap-0.5"><ToolbarBtn icon={Undo2} /><ToolbarBtn icon={Redo2} /></div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Bold, 'bold', () => toggleFormat('**'))}
                            {renderToolbarBtn(Italic, 'italic', () => toggleFormat('_'))}
                            {renderToolbarBtn(Underline, 'underline', () => toggleFormat('__'))}
                            {renderToolbarBtn(Strikethrough, 'strikethrough', () => toggleFormat('~~'))}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Code, 'code', () => toggleFormat('``` \n'))}
                            {renderToolbarBtn(List, 'ul')}
                            {renderToolbarBtn(ListOrdered, 'ol')}
                            {renderToolbarBtn(SquareCheck, 'check')}
                        </div>
                    </div>
                    <div className="flex bg-[#121315] flex-1 relative">
                        <textarea ref={textareaRef} className="flex-1 w-full h-full bg-transparent p-6 text-gray-300 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar" placeholder="# Start writing..." value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
                    </div>
                </div>

                {/* 2. Resizer */}
                <div onMouseDown={startResizing} className={`bg-gray-900 w-1.5 cursor-col-resize z-30 flex items-center justify-center border-l border-r border-white/5 ${isResizing ? 'bg-blue-600' : ''}`}>
                    <GripVertical size={10} className="text-gray-500" />
                </div>

                {/* 3. Right: Preview */}
                <div className="flex flex-col bg-[#121315]" style={{ width: `${100 - editorRatio}%` }}>
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0f1011]">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Preview</span>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none bg-[#0f1011] custom-scrollbar">
                        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>
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
                <TagEditorModal
                    isOpen={isTagEditorOpen}
                    onClose={() => setIsTagEditorOpen(false)}
                    currentTags={activeTags}
                    onSave={handleSaveTags} // Hàm này sẽ cập nhật activeTags
                />
                {isResizing && <div className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent" />}
            </div>
        </main>
    );
}