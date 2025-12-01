import Sidebar from "../../components/Layout/Sidebar";
import { ConfirmDialog } from "../../components/Layout/Dialog";
import { CreateDocumentModal, TagEditorModal } from '../../components/Layout/Modal';
import { TagDropMenu, SortDropMenu } from "../../components/Layout/DropMenu";

import { useState } from 'react';
import { useUIContext } from "../../context/useUIContext";
import { Link } from "react-router";


import {
    Edit, SortAsc, Tag, Search, X, Grid, List, Plus, MoreVertical, EllipsisVertical, Eye, Trash2, Bookmark, Check, ArrowDownAZ, ArrowUpZA, Calendar, Clock
} from 'lucide-react';

const mockCards = [
    { id: '1', title: 'aproject 02', date: '23/06/1782', tags: [], members: 2, note: 'Nội dung tóm tắt...' },
    { id: '2', title: 'bMML - note', date: '21/05/1782', tags: [], members: 0, note: '' },
    { id: '3', title: 'cproject 01', date: '23/04/1782', tags: ['security', 'mailflood'], members: 0, note: 'Nội dung tóm tắt...' },
    { id: '4', title: 'dWriteup CTF', date: '23/03/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { id: '6', title: 'eWriteup CTF', date: '21/02/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { id: '7', title: 'fMML - note', date: '21/08/1782', tags: [], members: 0, note: '' },
    { id: '8', title: 'gproject 02', date: '21/09/1782', tags: ['security', 'mailflood'], members: 3, note: 'Nội dung tóm tắt...' },
    { id: '9', title: 'zproject 01', date: '20/10/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
]

const DocumentCard = ({ card, isExpanded }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(card.tags.includes('bookmarked'));

    // --- MỚI: State quản lý tags và Modal ---
    const [activeTags, setActiveTags] = useState(card.tags);
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);





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
                <Link to="/home/editor" state={{ document: card }}>
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
    const [documents, setDocuments] = useState(mockCards);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        title: '',
        date: ''
    });
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [filterTags, setFilterTags] = useState([]); // Mảng chứa các tag đang lọc


    const handleToggleFilterTag = (tag) => {
        setFilterTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag); // Bỏ chọn
            } else {
                return [...prev, tag]; // Chọn thêm
            }
        });
    };

    const handleCloseSort = () => {
        setIsSortOpen(false);
    };

    // Hàm Xóa Cấu Hình (Truyền vào Menu)
    const handleClearSort = () => {
        setSortConfig({ title: null, date: null });
        setIsSortOpen(false);
    };


    // ---  State cho Sort Filter ---
    const toggleSort = () => {
        setIsSortOpen(!isSortOpen)

    }

    const handleSortSelection = (type, value) => {
        setSortConfig(prev => {
            return {
                ...prev,
                [type]: value // type là 'title' hoặc 'date'
            };
        });
    };

    const toggleList = () => {
        setIsExpanded(!isExpanded)
        console.log(isExpanded)
    };

    const parseDate = (dateStr) => {

        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split('/');

        return new Date(`${year}-${month}-${day}`);
    }


    // ---  Hàm cho Sort và Tag filter ---
    const filteredAndSortedDocuments = [...documents]
        // BƯỚC A: LỌC THEO TAG VÀ SEARCH BAR
        .filter(doc => {
            const searchTerm = value.toLowerCase().trim();
            const matchesTagFilter = (filterTags.length === 0) ||
                filterTags.some(filterTag => doc.tags.includes(filterTag));

            // Điều kiện 1: Kiểm tra xem tài liệu có thỏa mãn bộ lọc tags đã chọn không
            // Điều kiện 2: Kiểm tra xem tài liệu có thỏa mãn thanh search không

            // --- LOGIC LỌC TỔNG HỢP ---
            const matchesSearchTerm =
                // Nếu thanh search trống thì luôn thỏa mãn (true)
                (searchTerm === "") ||
                // HOẶC (Title chứa từ khóa search)
                doc.title.toLowerCase().includes(searchTerm) ||
                // HOẶC (Bất kỳ Tag nào của document chứa từ khóa search)
                doc.tags.some(tag => tag.toLowerCase().includes(searchTerm));


            // Điều kiện cuối cùng: Tài liệu phải thỏa mãn cả Lọc Tags (nếu có) VÀ Lọc Search (nếu có)
            return matchesTagFilter && matchesSearchTerm;
        })
        // BƯỚC B: SẮP XẾP (Giữ nguyên logic cũ)
        .sort((a, b) => {
            // ... Logic sortConfig cũ giữ nguyên ...
            if (sortConfig.date) {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                    return sortConfig.date === 'latest' ? dateB - dateA : dateA - dateB;
                }
            }
            if (sortConfig.title) {
                return sortConfig.title === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            return 0;
        });

    return (
        <>
            <div className="flex flex-row items-left justify-between h-screen" >
                <Sidebar />

                <div className={`flex-grow p-6 overflow-y-auto bg-gray-900 text-gray-100 transition-all duration-500 ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}>

                    {/* Toolbar */}
                    <div className="w-full p-3 mb-6 bg-gray-800 rounded-xl shadow-lg" >
                        <div className="flex flex-wrap items-center justify-between gap-3">

                            {/* LEFT AREA */}
                            <div className="flex items-center gap-3 flex-1">

                                {/* Sort */}
                                <button onClick={toggleSort} className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                                    <SortAsc size={20} className="mr-2" />
                                    <span className="hidden md:block font-medium">Sort</span>
                                </button>




                                {/* Tags */}
                                <button
                                    onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                                    className={`flex items-center px-2 py-1 rounded-lg transition flex-shrink-0 
                                            ${isTagMenuOpen || filterTags.length > 0 ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'}
                                        `}
                                >
                                    <span className="hidden md:block font-medium">Tags</span>
                                </button>

                                {/* SEARCH BAR */}
                                <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 
                            w-full md:w-auto md:max-w-sm">
                                    <Search size={14} className="text-gray-400 mr-2" />

                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="bg-transparent text-gray-100 placeholder-gray-400 
                               focus:outline-none w-full"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                    />

                                    {value && (
                                        <button onClick={() => setValue("")}
                                            className="p-1 rounded-full hover:bg-gray-600">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT AREA */}
                            <div className="flex items-center gap-3 flex-shrink-0">

                                <button onClick={toggleList}
                                    className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0">
                                    {isExpanded ? <Grid size={20} /> : <List size={20} />}
                                </button>

                                <button onClick={() => setIsModalOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-700 flex-shrink-0">
                                    <Plus size={20} />
                                </button>

                                <button className="p-2 rounded-lg hover:bg-gray-700 flex-shrink-0">
                                    <MoreVertical size={20} />
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

                        {filteredAndSortedDocuments.map(doc => (
                            <DocumentCard key={doc.id} card={doc} isExpanded={isExpanded} />
                        ))}
                    </div>

                </div>

            </div>


            <SortDropMenu
                isOpen={isSortOpen}
                onClose={handleCloseSort}
                sortConfig={sortConfig}
                onSelect={handleSortSelection}
                onClear={handleClearSort}
            />

            <CreateDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <TagDropMenu
                isOpen={isTagMenuOpen}
                onClose={() => setIsTagMenuOpen(false)}
                selectedTags={filterTags}
                onToggleTag={handleToggleFilterTag}
            />


        </>
    );
}