import Sidebar from "../../components/Layout/Sidebar";
import { ConfirmDialog } from "../../components/Layout/Dialog";
import { CreateDocumentModal, DocumentSettingsModal } from '../../components/Layout/Modal';
import { useDocument } from '../../context/DocumentContext';
import { useState, useEffect } from 'react';
import { useUIContext } from "../../context/useUIContext";
import { Link } from "react-router";
import FilterToolbar from '../../components/Layout/FilterToolbar';
import {
    Edit, Tag, Plus, MoreVertical, EllipsisVertical, Eye, Trash2, Bookmark
} from 'lucide-react';
import { useTagService } from '../../services/tagService';


const DocumentCard = ({ card, isExpanded }) => {
    console.log("Full Card Data:", card);

    const { deleteDocument, handleDocumentUpdate, toggleBookmark } = useDocument();
    const [showMenu, setShowMenu] = useState(false);

    // Use prop for bookmark state, fallback to False
    const isBookmarked = card.isBookmarked || false;

    const [title, setTitle] = useState(card?.title || "");

    const [privacy, setPrivacy] = useState(card.isPublic ? 'public' : 'private');

    // --- MỚI: State quản lý tags và Modal ---
    const [activeTags, setActiveTags] = useState(card.tags || []);
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);

    const [menuPositionClass, setMenuPositionClass] = useState("left-0 top-full mt-2");

    // Check if blank (using activeTags)
    const isBlank = !card.note && card.members === 0 && activeTags.length === 0;





    const toggleMenu = (e) => {
        // Nếu menu đang ĐÓNG và chuẩn bị MỞ
        if (!showMenu) {
            const buttonRect = e.currentTarget.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Ước lượng kích thước menu (w-48 ~ 200px, chiều cao ~ 250px)
            const menuWidth = 200;
            const menuHeight = 250;

            // 1. Xử lý trục Ngang (Left/Right)
            // Nếu khoảng cách từ nút đến mép phải < chiều rộng menu -> Canh phải (right-0)
            // Ngược lại -> Canh trái (left-0)
            let xClass = "left-0";
            if (buttonRect.left + menuWidth > screenWidth) {
                xClass = "right-0";
            }

            // 2. Xử lý trục Dọc (Top/Bottom)
            // Nếu khoảng cách từ đáy nút đến mép dưới màn hình < chiều cao menu -> Xổ lên trên (bottom-full)
            // Ngược lại -> Xổ xuống dưới (top-full)
            let yClass = "top-full mt-2";
            if (buttonRect.bottom + menuHeight > screenHeight) {
                yClass = "bottom-full mb-2";
            }

            setMenuPositionClass(`${xClass} ${yClass}`);
        }

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
        setShowMenu(!showMenu)
        openDialog({
            title: "Delete note",
            msg: "Are you sure you want to delete your note?",
            confirmText: "Yes, Delete It",
            cancelText: "Cancel",
            isDanger: true,
            onConfirm: async () => {
                try {
                    // Gọi hàm xóa từ Context
                    await deleteDocument(card.id);

                    console.log("Deleted via Context");
                    closeDialog();
                } catch (error) {
                    console.error("Failed to delete", error);
                    alert("Không thể xóa tài liệu: " + error.message);
                }
            }
        });
    };

    const closeDialog = () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleBookmark = async () => {
        setShowMenu(false);
        await toggleBookmark(card.id);
    };

    // --- MỚI: Hàm xử lý mở modal Edit Tag ---
    const handleOpenTagEditor = () => {
        setShowMenu(false); // Đóng menu 3 chấm
        setIsTagEditorOpen(true); // Mở modal
    };

    // --- MỚI: Hàm lưu tags từ modal ---
    const handleSaveTags = (newTags) => {
        setActiveTags(newTags);
        handleDocumentUpdate(card.id, { tags: newTags });
        console.log(`Saved tags for ${card.title}:`, newTags);
        setIsTagEditorOpen(false);
    };

    const handleTitleAndPrivacyUpdate = (newTitle, newPrivacy) => {
        // Kiểm tra ID
        const docId = card?.id || card?._id;
        if (!docId) {
            console.error("❌ ERROR: Document ID is missing");
            return;
        }



        // Cập nhật State UI ngay lập tức
        setTitle(newTitle);
        setPrivacy(newPrivacy);

        // Gọi API với dữ liệu đã chuẩn hóa
        handleDocumentUpdate(docId, {
            title: newTitle,
            isPublic: newPrivacy === 'public',
            tags: activeTags // Gửi kèm tags để đảm bảo không bị mất
        });
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

            <div className="bg-gray-800  rounded-lg shadow-xl overflow-visible hover:ring-2 hover:ring-blue-500 transition duration-200 relative">
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
                        <p className="text-lg font-semibold truncate">{title}</p>

                        <div className="relative">
                            <button
                                onClick={toggleMenu}
                                className={`hover:bg-gray-700 rounded p-1 transition ${showMenu ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                            >
                                <EllipsisVertical size={20} />
                            </button>

                            {/* Menu Popup */}
                            {showMenu && (
                                <div
                                    className={`absolute w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${menuPositionClass}`}
                                >
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
                                        <span>Edit document</span>
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
                    <p className="text-xs text-gray-400 mt-1">{card.createdDate || card.date}</p>
                </div>
            </div>

            {/* --- MỚI: Nhúng Component DocumentSettingsModal --- */}

            <DocumentSettingsModal
                isOpen={isTagEditorOpen}
                onClose={() => setIsTagEditorOpen(false)}
                currentTags={activeTags}
                onSave={handleSaveTags} // Lưu Tags


                documentTitle={title}
                currentPrivacy={privacy}

                onUpdateInfo={(newTitle, newPrivacy) => {
                    handleTitleAndPrivacyUpdate(newTitle, newPrivacy);
                }}

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
    // Persistent State
    const { showSidebar, workspaceState, setWorkspaceState } = useUIContext();
    const { isExpanded, searchValue: value, sortConfig, filterTags } = workspaceState;

    const { listDocuments, loading, fetchListDocuments, error } = useDocument();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);

    const { getAllTags } = useTagService();

    // 1. Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            const tags = await getAllTags();
            const uniqueTags = [...new Set([...tags])];
            setAvailableTags(uniqueTags);
        }
        fetchTags();
    }, []);


    useEffect(() => {
        fetchListDocuments();

    }, [fetchListDocuments]);

    const handleTagSelection = (tag) => {
        setWorkspaceState(prev => {
            const currentTags = prev.filterTags;
            const newTags = currentTags.includes(tag)
                ? currentTags.filter(t => t !== tag)
                : [...currentTags, tag];
            return { ...prev, filterTags: newTags };
        });
    };

    const handleCloseSort = () => {
        setIsSortOpen(false);
    };

    // Hàm Xóa Cấu Hình (Truyền vào Menu)
    const handleClearSort = () => {
        setWorkspaceState(prev => ({
            ...prev,
            sortConfig: { title: null, date: null }
        }));
        setIsSortOpen(false);
    };

    // ---  State cho Sort Filter ---
    const toggleSort = () => {
        setIsSortOpen(!isSortOpen)
    }

    const handleSortSelection = (type, val) => {
        setWorkspaceState(prev => ({
            ...prev,
            sortConfig: {
                ...prev.sortConfig,
                [type]: val
            }
        }));
    };

    const toggleList = () => {
        setWorkspaceState(prev => ({
            ...prev,
            isExpanded: !prev.isExpanded
        }));
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        // Attempt to parse ISO string first (YYYY-MM-DD)
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Fallback for DD/MM/YYYY if needed (legacy/mock)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`);
        }

        return new Date(0);
    }


    // ---  Hàm cho Sort và Tag filter ---

    const safeDocuments = Array.isArray(listDocuments) ? listDocuments : [];
    const filteredAndSortedDocuments = [...safeDocuments]
        .filter(doc => {
            const searchTerm = value.toLowerCase().trim();
            const docTags = doc.tags || []; // An toàn nếu tags bị null

            const matchesTagFilter = (filterTags.length === 0) ||
                filterTags.some(filterTag => docTags.includes(filterTag));

            const matchesSearchTerm =
                (searchTerm === "") ||
                doc.title.toLowerCase().includes(searchTerm) ||
                docTags.some(tag => tag.toLowerCase().includes(searchTerm));

            return matchesTagFilter && matchesSearchTerm;
        })
        .sort((a, b) => {
            if (sortConfig.date) {
                const dateA = parseDate(a.createdDate || a.date); // Support both for safety
                const dateB = parseDate(b.createdDate || b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                    return sortConfig.date === 'latest' ? dateB - dateA : dateA - dateB;
                }
            }
            if (sortConfig.title) {
                return sortConfig.title === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            }
            return 0;
        });

    return (
        <>
            <div className="flex flex-row items-left justify-between h-screen" >
                <Sidebar />



                <div className={`flex-grow p-6 overflow-y-auto bg-gray-900 text-gray-100 transition-all duration-500 ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}>

                    {/* Toolbar */}
                    <FilterToolbar
                        searchValue={value}
                        setSearchValue={(val) => setWorkspaceState(prev => ({ ...prev, searchValue: val }))}
                        sortConfig={sortConfig}
                        filterTags={filterTags}
                        isSortOpen={isSortOpen}
                        setIsSortOpen={setIsSortOpen}
                        isTagMenuOpen={isTagMenuOpen}
                        setIsTagMenuOpen={setIsTagMenuOpen}
                        availableTags={availableTags}
                        viewMode={isExpanded ? 'list' : 'grid'} // Myworkspace logic: isExpanded=true means LIST view (showing details), false means GRID?
                        // Wait, looking at original code:
                        // {isExpanded ? <Grid size={20} /> : <List size={20} />}
                        // If isExpanded is true, it shows Grid icon (meaning click to switch to grid?), implies current is List?
                        // "isExpanded" usually means items are expanded.
                        // Let's keep logic simple: pass setViewMode that calls toggleList.
                        setViewMode={() => toggleList()} // Function signature mismatch fix: toggleList doesn't take args but component might pass args.
                        // Actually in FilterToolbar: setViewMode(prev => prev === 'grid' ? ...).
                        // Myworkspace toggleList just toggles boolean.
                        // Let's pass a custom wrapper or just leave viewMode prop as string key for icon, and setViewMode as handler.
                        // Render logic in FilterToolbar uses viewMode === 'grid' ? ...
                        // In Myworkspace: {isExpanded ? <Grid /> : <List />}
                        // So if isExpanded (List View?), show Grid icon.
                        // Let's just match icon logic.
                        // If isExpanded is true, we want Grid icon -> viewMode='grid' (so icon is grid)?
                        // No, if viewMode='grid', icon is Grid.
                        // So pass viewMode={isExpanded ? 'grid' : 'list'}
                        onSortSelection={handleSortSelection}
                        onSortClear={handleClearSort}
                        onTagSelection={handleTagSelection}
                    >
                        <button onClick={() => setIsModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-700 flex-shrink-0">
                            <Plus size={20} />
                        </button>

                        <button className="p-2 rounded-lg hover:bg-gray-700 flex-shrink-0">
                            <MoreVertical size={20} />
                        </button>
                    </FilterToolbar>

                    {/* Document Grid */}
                    {loading ? (
                        <div className="text-center text-gray-400 mt-10">Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div className="text-center text-red-400 mt-10">Lỗi: {error}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAndSortedDocuments.map(doc => (
                                <DocumentCard key={doc.id} card={doc} isExpanded={isExpanded} />
                            ))}
                            {filteredAndSortedDocuments.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    Cannot find any documents.
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>




            <CreateDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />




        </>
    );
}