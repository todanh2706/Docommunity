import Sidebar from "../../components/Layout/Sidebar1";
import {TagEditorModal } from "../../components/Layout/Tag";
import { ConfirmDialog } from "../../components/Layout/ConfirmDialog";
import { useState } from 'react';
import { Link } from "react-router";
import { useUIContext } from '../../context/useUIContext';

import {
    Edit, SortAsc, Tag, Search, X, Grid, List, Plus, Upload, MoreVertical, EllipsisVertical, Eye, Trash2, Bookmark, PenLine
} from 'lucide-react';

const mockCards = [
    { title: 'project 02', date: '23/01/1782', tags: [], members: 2, note: 'Nội dung tóm tắt...' },
    { title: 'MML - note', date: '21/01/1782', tags: [], members: 0, note: '' },
    { title: 'project 01', date: '23/01/1782', tags: ['security', 'mailflood'], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'Writeup CTF', date: '23/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'Writeup CTF', date: '21/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'MML - note', date: '21/01/1782', tags: [], members: 0, note: '' },
    { title: 'project 02', date: '21/01/1782', tags: ['security', 'mailflood'], members: 3, note: 'Nội dung tóm tắt...' },
    { title: 'project 01', date: '20/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
];



const DocumentCard = ({ card, isExpanded }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(card.tags.includes('bookmarked'));

    // --- MỚI: State quản lý tags và Modal ---
    const [activeTags, setActiveTags] = useState(card.tags);
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    // ---------------------------------------




    const isBlank = !card.note && card.members === 0 && activeTags.length === 0; // Lưu ý dùng activeTags thay vì card.tags để check blank


    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: "",
        msg: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        isDanger: false,
        onConfirm: () => { },
        onCancel: () => { }
    });
    const openDialog = (config) => {
        setDialogConfig({ ...config, isOpen: true });
    };

    const confirmDeleteNote = () => {
        openDialog({
            title: "Delete note",
            msg: "Are you sure you want to delete your note? Your note will be moved to My trash",
            confirmText: "Yes, Delete It",
            cancelText: "Cancel",
            isDanger: true, // Bật màu đỏ
            onConfirm: () => {
                console.log("Note Deleted!");
                // Logic logout/redirect...
            }
        });
    };
    const closeDialog = () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        setShowMenu(false);
    };

    // --- MỚI: Hàm xử lý mở modal Edit Tag ---
    const handleOpenTagEditor = () => {
        setShowMenu(false); // Đóng menu 3 chấm
        setIsTagEditorOpen(true); // Mở modal
    };

    // --- MỚI: Hàm lưu tags từ modal ---
    const handleSaveTags = (newTags) => {
        setActiveTags(newTags); // Cập nhật UI
        // Ở đây bạn sẽ gọi API để lưu vào DB: updateDocTags(card.id, newTags)
        console.log(`Saved tags for ${card.title}:`, newTags);
        setIsTagEditorOpen(false); // Đóng modal
    };

    // LOGIC XỬ LÝ HIỂN THỊ TAG
    const tags = activeTags; // hoặc card.tags tùy code hiện tại của bạn
    const shouldCollapse = tags.length > 2; // Chỉ gom gọn nếu > 3 tags

    // Nếu gom gọn: lấy 2 tag đầu. Nếu không: lấy tất cả.
    const visibleTags = shouldCollapse ? tags.slice(0, 2) : tags;
    const remainingCount = tags.length - 2; // Số lượng tag bị ẩn

    return (
        <>
            {/* Component Card chính */}

            <div className="bg-gray-800 rounded-lg shadow-xl overflow-visible hover:ring-2 hover:ring-blue-500 transition duration-200 relative">
                {/* Phần Body giữ nguyên, CHỈ sửa card.tags thành activeTags */}
                <Link to="/home/editor">
                    <div className={`p-4 ${isExpanded ? 'h-48' : 'h-10'} flex flex-col justify-between ${isBlank && isExpanded ? 'bg-gray-700' : ''}`}>
                        {isBlank && isExpanded ? (
                            <div className="flex-grow flex items-center justify-center text-gray-500 ">
                                <Edit size={32} />
                            </div>
                        ) : (
                            <>
                                {isExpanded ? (<img src='logo.png' className="w-32 h-auto" alt="logo" />) : null}

                                <div className={`flex justify-between items-center ${isExpanded ? 'mt-4' : ''}`}>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                                            <span role="img" aria-label="user">🙂</span>
                                        </div>
                                        {card.members > 0 && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                                                +{card.members}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex space-x-1 items-center">
                                        {isBookmarked && <Bookmark size={14} className="text-yellow-400 fill-current" />}

                                        {/* 1. Hiển thị các tag được phép hiện */}
                                        {visibleTags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-blue-300">
                                                {tag}
                                            </span>
                                        ))}

                                        {/* 2. Hiển thị số lượng tag còn lại (nếu có) */}
                                        {shouldCollapse && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300 font-medium border border-gray-600">
                                                +{remainingCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Link>

                {/* Footer */}
                <div className={`p-3 ${isExpanded ? "border-t border-gray-700" : ""} `}>
                    <div className="flex flex-row justify-between items-center relative">
                        <p className="text-lg font-semibold truncate">{card.title}</p>

                        <div className="relative">
                            <button
                                onClick={toggleMenu}
                                className={`hover:bg-gray-700 rounded p-1 transition ${showMenu ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                            >
                                <EllipsisVertical size={20} />
                            </button>

                            {/* Menu Popup */}
                            {showMenu && (
                                <div className="absolute left-2 bottom-end mb-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <Link to="/home/editor" >
                                        <button className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition">
                                            <Eye size={16} />
                                            <span>View mode</span>
                                        </button>
                                    </Link>

                                    {/* --- MỚI: Gắn sự kiện mở Modal --- */}
                                    <button
                                        onClick={handleOpenTagEditor}
                                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition"
                                    >
                                        <Tag size={16} />
                                        <span>Edit tags</span>
                                    </button>

                                    <button
                                        onClick={handleBookmark}
                                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition"
                                    >
                                        <Bookmark size={16} className={isBookmarked ? "fill-yellow-400 text-yellow-400" : ""} />
                                        <span>{isBookmarked ? "Remove bookmark" : "Add bookmark"}</span>
                                    </button>

                                    <div className="h-px bg-gray-700 mx-2"></div>

                                    <button onClick={confirmDeleteNote} className="flex items-center space-x-3 px-4 py-3 hover:bg-red-900/30 text-left text-sm text-red-400 transition">
                                        <Trash2 size={16} />
                                        <span>Delete note</span>
                                    </button>
                                </div>
                            )}

                            {showMenu && (
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenu(false)}></div>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{card.date}</p>
                </div>
            </div>

            {/* --- MỚI: Nhúng Component TagEditorModal --- */}
            {/* Modal nằm ngoài cấu trúc DOM của Card để tránh bị overflow:hidden nếu có, nhưng ở đây đặt cạnh Card vẫn ổn vì dùng position fixed */}
            <TagEditorModal
                isOpen={isTagEditorOpen}
                onClose={() => setIsTagEditorOpen(false)}
                currentTags={activeTags}
                onSave={handleSaveTags}
            />
            <ConfirmDialog
                isOpen={dialogConfig.isOpen}
                onClose={closeDialog}
                {...dialogConfig} // Truyền toàn bộ config (title, msg, onConfirm...) vào
            />


        </>
    );
};


export default function Myworkspace() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState("");
    const { showSidebar } = useUIContext();

    const toggleList = () => {
        setIsExpanded(!isExpanded)
        console.log(isExpanded)
    };

    return (
        <>
            <div className="flex flex-row items-left justify-between h-screen">
                <Sidebar />
                <div className={`flex-grow p-6 overflow-y-auto bg-gray-900 text-gray-100 transition-all duration-500 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
                    {/* Search and Action Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-2 mb-6 bg-gray-800 rounded-lg shadow-lg">

                        {/* Left Actions: Sort & Tags */}
                        <div className="flex items-center space-x-1 md:space-x-4">
                            <button className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition">
                                <SortAsc size={20} className="mr-2" />
                                <span className="hidden md:block font-medium">Sort</span>
                            </button>
                            <button className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition">
                                <Tag size={20} className="mr-2" />
                                <span className="hidden md:block font-medium">Tags</span>
                            </button>

                            {/* Search Input (Mockup of the image's search bar) */}
                            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1">
                                <Search size={14} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none w-8 md:w-35 "
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                <button onClick={() => setValue("")} className="p-1 rounded-full hover:bg-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions: View Toggles & Other */}
                        <div className="flex items-center space-x-4">
                            <button onClick={toggleList} className="p-2 rounded-lg bg-blue-600 text-white">
                                {isExpanded ? (<Grid size={20} />) : <List size={20} />}
                                {/* Active Grid View */}
                            </button>

                            <button className="p-2 rounded-lg hover:bg-gray-700">
                                <Plus size={20} />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-700">
                                <Upload size={20} />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-700">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {mockCards.map((card, index) => (
                            <DocumentCard key={index} card={card} isExpanded={isExpanded} />
                        ))}
                    </div>
                </div>
            </div>


        </>
    );
}