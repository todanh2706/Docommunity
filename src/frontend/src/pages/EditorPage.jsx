import { useState, useRef, useEffect, useCallback } from "react"; // 1. Import thêm hooks

import {
    Edit2, Bookmark, Tag, MessageSquareText, Columns2,
    Undo2, Redo2, Bold, Italic, Underline, Code, Table as TableIcon, // Đổi tên Table để tránh trùng html table
    List, Link as LinkIcon, Image as ImageIcon, Strikethrough, ListOrdered, SquareCheck,
    ChevronDown, GripVertical // 2. Import thêm icon GripVertical cho thanh kéo
} from "lucide-react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'


import 'highlight.js/styles/github-dark.css'

const ToolbarBtn = ({ icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-1.5 text-gray-400 rounded-md ${isActive ? 'bg-gray-700 ' : ''} hover:bg-gray-700 hover:text-white transition-all duration-200`}>
        <Icon size={18} />
    </button>
);

const Divider = () => <div className="h-5 w-[1px] bg-gray-700 mx-1"></div>;

export default function EditorPage() {
    // --- STATE  ---
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTools, setSelectedTools] = useState([]);
    const [markdown, setMarkdown] = useState("");

    const textareaRef = useRef(null); // 1. Khai báo ref

    // --- 3. STATE ---
    const [isResizing, setIsResizing] = useState(false);
    const [editorRatio, setEditorRatio] = useState(50); // Mặc định chia đôi 50%
    const containerRef = useRef(null); // Ref để tham chiếu khung chứa editor



    const toggleFormat = (symbol) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const before = markdown.substring(0, start);
        const selected = markdown.substring(start, end);
        const after = markdown.substring(end);

        // Chèn ký tự (ví dụ: ** hoặc _ hoặc `)
        const newText = `${before}${symbol}${selected}${symbol}${after}`;

        setMarkdown(newText);

        // Đưa con trỏ vào giữa hoặc bao quanh vùng chọn
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + symbol.length, end + symbol.length);
        }, 0);
    };
    // --- LOGIC CŨ ---
    const handleToolClick = (toolName) => {
        setSelectedTools(currentTools => {
            if (currentTools.includes(toolName)) {
                return currentTools.filter(tool => tool !== toolName);
            } else {
                return [...currentTools, toolName];
            }
        });
    };

    const renderToolbarBtn = (Icon, toolName, action) => (
        <ToolbarBtn
            icon={Icon}
            isActive={selectedTools.includes(toolName)}
            onClick={action ? action : () => handleToolClick(toolName)}
        />
    );

    const toggleDropDown = () => { setIsOpen(!isOpen); };

    // --- 4. LOGIC RESIZE MỚI ---
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    const resize = useCallback((e) => {
        if (isResizing && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            // Tính toán tỷ lệ % dựa trên vị trí chuột trong container
            const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Giới hạn Min 20% - Max 80% để không bị kéo mất khung
            if (newRatio > 20 && newRatio < 80) {
                setEditorRatio(newRatio);
            }
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


    return (
        <main className="flex flex-col h-screen text-gray-300 font-sans overflow-hidden bg-[rgb(6,4,36)] text-white">

            {/* === HEADER (Giữ nguyên) === */}
            <header className="flex h-16 shrink-0 border-b border-white/10 px-4 justify-between items-center z-20">
                <div className="flex items-center gap-6">
                    <img src='/logo_small.png' className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" alt="Logo" />
                    <div className="flex items-center gap-2 group">
                        <input
                            className="bg-transparent text-lg font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-2 py-1 w-48 transition-all placeholder:text-gray-600"
                            id="name"
                            type="text"
                            placeholder="Untitled Notebook"
                        />
                        <Edit2 size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-white/5">
                        <ToolbarBtn icon={Columns2} />
                        <ToolbarBtn icon={Bookmark} />
                        <ToolbarBtn icon={Tag} />
                        <ToolbarBtn icon={MessageSquareText} />
                    </div>
                    <button className="flex items-center py-1.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-900/20">
                        Share
                    </button>
                    <div className="relative">
                        <div onClick={toggleDropDown} className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                            <img className="w-full h-full object-cover" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s" alt="User" />
                        </div>
                        {isOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm text-white font-medium">Bonnie Green</p>
                                    <p className="text-xs text-gray-500 truncate">name@flowbite.com</p>
                                </div>
                                <ul className="py-1 text-sm text-gray-400">
                                    <li><a href="#" className="block px-4 py-2 hover:bg-white/5 hover:text-white">Dashboard</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-white/5 hover:text-white">Settings</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-white/5 text-red-400 hover:text-red-300">Sign out</a></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* === MAIN EDITOR AREA (Có sửa đổi) === */}
            {/* Thêm ref={containerRef} để tính toán tọa độ chuột */}
            <div className="flex flex-1 overflow-hidden relative" ref={containerRef}>

                {/* --- 1. Left Panel: Markdown Editor --- */}
                {/* Thay w-1/2 cố định bằng style width động theo editorRatio */}
                <div
                    className="flex flex-col border-r border-white/10"
                    style={{ width: `${editorRatio}%` }}
                >
                    {/* Editor Toolbar (Giữ nguyên) */}
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 sticky top-0 z-10 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={Undo2} />
                            <ToolbarBtn icon={Redo2} />
                        </div>
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
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={LinkIcon} isActive={false} onClick={() => console.log('Link clicked')} />
                            <ToolbarBtn icon={ImageIcon} isActive={false} onClick={() => console.log('Image clicked')} />
                            <ToolbarBtn icon={TableIcon} isActive={false} onClick={() => console.log('Table clicked')} />
                        </div>
                    </div>

                    {/* Text Area (Giữ nguyên) */}
                    <div className="flex bg-[#121315] flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            className="flex-1 w-full h-full bg-transparent p-6 text-gray-300 resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder:text-gray-700 custom-scrollbar"
                            placeholder="# Start writing your masterpiece..."
                            spellCheck={false}
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                        />
                    </div>

                    {/* Status Bar (Giữ nguyên) */}
                    <div className="px-4 py-1 text-xs text-gray-600 bg-[#0f1011] border-t border-white/5 flex justify-between">
                        <span>Markdown Mode</span>
                        <span>{markdown.length} words</span>
                    </div>
                </div>

                {/* --- 2. RESIZER BAR (Thanh kéo mới thêm) --- */}
                <div
                    onMouseDown={startResizing}
                    className={`
                        bg-gray-900 w-1.5 cursor-col-resize z-30 flex items-center justify-center
                        border-l border-r border-white/5 hover:bg-blue-600 transition-colors
                        ${isResizing ? 'bg-blue-600' : ''}
                    `}
                >
                    <GripVertical size={10} className="text-gray-500" />
                </div>

                {/* --- 3. Right Panel: Preview --- */}
                {/* Thay w-1/2 cố định bằng style width động (phần còn lại) */}
                <div
                    className="flex flex-col bg-[#121315]"
                    style={{ width: `${100 - editorRatio}%` }}
                >
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Preview</span>
                    </div>

                    {/* Preview Content Area (Giữ nguyên) */}
                    <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400 bg-[#0f1011] custom-scrollbar">
                        <article className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-400 hover:prose-a:underline prose-table:border prose-table:border-white/20 prose-th:border prose-th:border-white/20 prose-th:p-2 prose-td:border prose-td:border-white/20 prose-td:p-2">
                            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} >
                                {markdown}
                            </Markdown>
                        </article>
                    </div>
                </div>

                {/* Overlay bảo vệ để chuột không bị trượt khi kéo nhanh */}
                {isResizing && (
                    <div className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent" />
                )}

            </div>
        </main>
    );
}