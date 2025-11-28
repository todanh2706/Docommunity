import { useState } from "react";

import {
    Edit2, Bookmark, Tag, MessageSquareText, Columns2,
    Undo2, Redo2, Bold, Italic, Underline, Code, Table,
    List, Link, Image, Strikethrough, ListOrdered, SquareCheck,
    ChevronDown
} from "lucide-react";
import Markdown from 'react-markdown'


const ToolbarBtn = ({ icon: Icon, isActive, onClick }) => (
    <button
        // Thay đổi onClick thành prop nhận được
        onClick={onClick}
        // Thay đổi isSelect thành isActive (prop)
        className={`p-1.5 text-gray-400 rounded-md ${isActive ? 'bg-gray-700 border' : ''} hover:bg-gray-700 hover:text-white transition-all duration-200`}>
        <Icon size={18} />
    </button>
);

export default function EditorPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTools, setSelectedTools] = useState([]);
    const [markdown, setMarkdown] = useState("# Welcome to your notebook\nStart typing something...");

    const handleToolClick = (toolName) => {
        setSelectedTools(currentTools => {
            if (currentTools.includes(toolName)) {
                // Nếu đã có trong mảng, loại bỏ nó (bỏ chọn)
                return currentTools.filter(tool => tool !== toolName);
            } else {
                // Nếu chưa có, thêm nó vào mảng (chọn)
                return [...currentTools, toolName];
            }
        });
    };

    const renderToolbarBtn = (Icon, toolName) => (
        <ToolbarBtn
            icon={Icon}
            // Kiểm tra xem toolName có trùng với selectedTool không
            isActive={selectedTools.includes(toolName)}
            // Truyền hàm click, kèm theo tên nút
            onClick={() => handleToolClick(toolName)}
        />

    );

    const toggleDropDown = () => {
        setIsOpen(!isOpen);
    };


    // Component đường kẻ dọc phân cách
    const Divider = () => <div className="h-5 w-[1px] bg-gray-700 mx-1"></div>;

    return (
        <main className="flex flex-col h-screen text-gray-300 font-sans overflow-hidden bg-[rgb(6,4,36)] text-white">

            {/* === HEADER === */}
            <header className="flex h-16 shrink-0 border-b border-white/10  px-4 justify-between items-center z-20">
                {/* Left: Logo & Title */}
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

                {/* Right: Tools & Profile */}
                <div className="flex items-center gap-5">
                    {/* Navigation Tools */}
                    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-white/5">
                        <ToolbarBtn icon={Columns2} />
                        <ToolbarBtn icon={Bookmark} />
                        <ToolbarBtn icon={Tag} />
                        <ToolbarBtn icon={MessageSquareText} />
                    </div>

                    <button className="flex items-center py-1.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-900/20">
                        Share
                    </button>

                    {/* Avatar Dropdown */}
                    <div className="relative">
                        <div
                            onClick={toggleDropDown}
                            className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-blue-500/50 transition-all"
                        >
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

            {/* === MAIN EDITOR AREA === */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Panel: Markdown Editor */}
                <div className="flex flex-col w-1/2 border-r border-white/10">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5  sticky top-0 z-10 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={Undo2} />
                            <ToolbarBtn icon={Redo2} />
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Bold, 'bold')}
                            {renderToolbarBtn(Italic, 'italic')}
                            {renderToolbarBtn(Underline, 'underline')}
                            {renderToolbarBtn(Strikethrough, 'strikethrough')}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            {renderToolbarBtn(Code, 'code')}
                            {renderToolbarBtn(List, 'ul')}
                            {renderToolbarBtn(ListOrdered, 'ol')}
                            {renderToolbarBtn(SquareCheck, 'check')}
                        </div>
                        <Divider />
                        <div className="flex items-center gap-0.5">
                            <ToolbarBtn icon={Link} isActive={false} onClick={() => console.log('Link clicked')} />
                            <ToolbarBtn icon={Image} isActive={false} onClick={() => console.log('Image clicked')} />
                            <ToolbarBtn icon={Table} isActive={false} onClick={() => console.log('Table clicked')} />
                        </div>
                    </div>

                    {/* Text Area */}
                    <div className=" bg-[#121315] h-screen"> <textarea
                        className="flex-1 w-full bg-transparent p-6 text-gray-300 resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder:text-gray-700 "
                        placeholder="# Start writing your masterpiece..."
                        spellCheck={false}
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                    /></div>


                    {/* Status Bar */}
                    <div className="px-4 py-1 text-xs text-gray-600 bg-[#0f1011] border-t border-white/5 flex justify-between">
                        <span>Markdown Mode</span>
                        <span>0 words</span>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex flex-col w-1/2 bg-[#121315]">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Preview</span>
                    </div>

                    {/* Preview Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400  bg-[#0f1011]">

                        <h1 className="text-2xl font-bold text-white mb-4">Welcome to your notebook</h1>
                        <p className="text-gray-400 mb-4">This is how your content will look once rendered.</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
                            <Markdown>
                                {markdown}
                            </Markdown>
                        </ul>
                    </div>
                </div>

            </div>
        </main>
    );
}
