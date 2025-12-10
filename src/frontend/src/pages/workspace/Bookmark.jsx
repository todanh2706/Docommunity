
import Sidebar from "../../components/Layout/Sidebar";
import { useDocument } from '../../context/DocumentContext';
import { useState, useEffect } from 'react';
import { useUIContext } from "../../context/useUIContext";
import { Link } from "react-router";
import { CreateDocumentModal, DocumentSettingsModal } from '../../components/Layout/Modal';
import { ConfirmDialog } from "../../components/Layout/Dialog";
import { TagDropMenu, SortDropMenu } from "../../components/Layout/DropMenu";


import {
    Edit, SortAsc, Tag, Search, X, Grid, List, Plus, MoreVertical, EllipsisVertical, Eye, Trash2, Bookmark as BookmarkIcon
} from 'lucide-react';


const DocumentCard = ({ card, isExpanded }) => {
    const { deleteDocument, handleDocumentUpdate } = useDocument();
    const [showMenu, setShowMenu] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(card.tags?.includes('bookmarked') || false);

    const [title, setTitle] = useState(card?.title || "");
    const [privacy, setPrivacy] = useState(card.isPublic ? 'public' : 'private');
    const [activeTags, setActiveTags] = useState(card.tags || []);
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    const [menuPositionClass, setMenuPositionClass] = useState("left-0 top-full mt-2");

    // Check if blank
    const isBlank = !card.note && card.members === 0 && activeTags.length === 0;

    const toggleMenu = (e) => {
        if (!showMenu) {
            const buttonRect = e.currentTarget.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const menuWidth = 200;
            const menuHeight = 250;

            let xClass = "left-0";
            if (buttonRect.left + menuWidth > screenWidth) {
                xClass = "right-0";
            }
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
        confirmText: "",
        cancelText: "",
        isDanger: false,
        onConfirm: () => { },
        onCancel: () => { }
    });

    const openDialog = (config) => {
        setDialogConfig({ ...config, isOpen: true });
    };

    const confirmDeleteNote = () => {
        setShowMenu(false);
        openDialog({
            title: "Delete note",
            msg: "Are you sure you want to delete this document?",
            confirmText: "Yes, Delete It",
            cancelText: "Cancel",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await deleteDocument(card.id);
                    closeDialog();
                } catch (error) {
                    alert("Failed to delete document: " + error.message);
                }
            }
        });
    };

    const closeDialog = () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleBookmark = () => {
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);
        setShowMenu(false);

        // Update tags
        let newTags;
        if (newIsBookmarked) {
            newTags = [...activeTags, 'bookmarked'];
        } else {
            newTags = activeTags.filter(t => t !== 'bookmarked');
        }
        // Deduplicate just in case
        newTags = [...new Set(newTags)];

        setActiveTags(newTags);
        handleDocumentUpdate(card.id, { tags: newTags });
    };

    const handleOpenTagEditor = () => {
        setShowMenu(false);
        setIsTagEditorOpen(true);
    };

    const handleSaveTags = (newTags) => {
        setActiveTags(newTags);
        handleDocumentUpdate(card.id, { tags: newTags });
        setIsTagEditorOpen(false);
    };

    const handleTitleAndPrivacyUpdate = (newTitle, newPrivacy) => {
        const docId = card?.id || card?._id;
        if (!docId) return;

        setTitle(newTitle);
        setPrivacy(newPrivacy);
        handleDocumentUpdate(docId, {
            title: newTitle,
            isPublic: newPrivacy === 'public',
            tags: activeTags
        });
    };

    const visibleTags = activeTags.length > 2 ? activeTags.slice(0, 2) : activeTags;
    const remainingCount = activeTags.length - 2;

    return (
        <>
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-visible hover:ring-2 hover:ring-blue-500 transition duration-200 relative">
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
                                    </div>

                                    <div className="flex space-x-1 items-center">
                                        {isBookmarked && <BookmarkIcon size={14} className="text-yellow-400 fill-current" />}
                                        {visibleTags.map(tag => (
                                            tag !== 'bookmarked' && tag !== 'TRASHED' && (
                                                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-blue-300">
                                                    {tag}
                                                </span>
                                            )
                                        ))}
                                        {remainingCount > 0 && (
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

                <div className={`p-3 ${isExpanded ? "border-t border-gray-700" : ""} `}>
                    <div className="flex flex-row justify-between items-center relative">
                        <p className="text-lg font-semibold truncate">{title}</p>
                        <div className="relative">
                            <button onClick={toggleMenu} className={`hover:bg-gray-700 rounded p-1 transition ${showMenu ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>
                                <EllipsisVertical size={20} />
                            </button>
                            {showMenu && (
                                <div className={`absolute w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${menuPositionClass}`}>
                                    <Link to="/home/editor">
                                        <button className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition">
                                            <Eye size={16} />
                                            <span>View mode</span>
                                        </button>
                                    </Link>
                                    <button onClick={handleOpenTagEditor} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition">
                                        <Tag size={16} />
                                        <span>Edit document</span>
                                    </button>
                                    <button onClick={handleBookmark} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-gray-200 transition">
                                        <BookmarkIcon size={16} className={isBookmarked ? "fill-yellow-400 text-yellow-400" : ""} />
                                        <span>{isBookmarked ? "Remove bookmark" : "Add bookmark"}</span>
                                    </button>
                                    <div className="h-px bg-gray-700 mx-2"></div>
                                    <button onClick={confirmDeleteNote} className="flex items-center space-x-3 px-4 py-3 hover:bg-red-900/30 text-left text-sm text-red-400 transition">
                                        <Trash2 size={16} />
                                        <span>Delete note</span>
                                    </button>
                                </div>
                            )}
                            {showMenu && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenu(false)}></div>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{card.date}</p>
                </div>
            </div>

            <DocumentSettingsModal
                isOpen={isTagEditorOpen}
                onClose={() => setIsTagEditorOpen(false)}
                currentTags={activeTags}
                onSave={handleSaveTags}
                documentTitle={title}
                currentPrivacy={privacy}
                onUpdateInfo={(newTitle, newPrivacy) => {
                    handleTitleAndPrivacyUpdate(newTitle, newPrivacy);
                }}
            />
            <ConfirmDialog
                isOpen={dialogConfig.isOpen}
                onClose={closeDialog}
                {...dialogConfig}
            />
        </>
    );
};

export default function Bookmark() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { showSidebar } = useUIContext();
    // In Bookmark, rely on listDocuments (which are active docs) and filter by 'bookmarked' tag
    // Note: getTrashedDocuments logic makes sure we don't see deleted ones here if filtered in documentService correctly.
    // However, if we want to show bookmarked items even if trash, we should rely on where we fetch.
    // Currently documentService.getAllDocument filters OUT 'TRASHED'. So bookmark view will only show active bookmarked docs. This is correct.
    const { listDocuments, loading, fetchListDocuments, error } = useDocument();

    const [value, setValue] = useState("");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        title: '',
        date: ''
    });
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [filterTags, setFilterTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // For Plus button if used

    useEffect(() => {
        fetchListDocuments();
    }, [fetchListDocuments]);

    // Handlers
    const toggleSort = () => setIsSortOpen(!isSortOpen);
    const handleCloseSort = () => setIsSortOpen(false);
    const handleClearSort = () => {
        setSortConfig({ title: null, date: null });
        setIsSortOpen(false);
    };
    const handleSortSelection = (type, value) => {
        setSortConfig(prev => ({
            ...prev,
            [type]: value
        }));
    };
    const toggleList = () => setIsExpanded(!isExpanded);
    const handleToggleFilterTag = (tag) => {
        setFilterTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const bookmarkedDocuments = (listDocuments || []).filter(doc =>
        doc.tags && doc.tags.includes('bookmarked')
    );

    const filteredAndSortedDocuments = [...bookmarkedDocuments]
        .filter(doc => {
            const searchTerm = value.toLowerCase().trim();
            const docTags = doc.tags || [];

            const matchesTagFilter = (filterTags.length === 0) ||
                filterTags.some(filterTag => docTags.includes(filterTag));

            const matchesSearchTerm =
                (searchTerm === "") ||
                doc.title.toLowerCase().includes(searchTerm) ||
                (docTags.some(tag => tag.toLowerCase().includes(searchTerm)));

            return matchesTagFilter && matchesSearchTerm;
        })
        .sort((a, b) => {
            if (sortConfig.date) {
                const dateA = new Date(a.date || a.createdAt || 0);
                const dateB = new Date(b.date || b.createdAt || 0);
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

                    <h1 className="flex items-center gap-2 text-2xl font-bold mb-6">
                        <BookmarkIcon size={28} />
                        BOOKMARKS
                    </h1>
                    {/* Toolbar */}
                    <div className="w-full p-3 mb-6 bg-gray-800 rounded-xl shadow-lg" >
                        <div className="flex flex-wrap items-center justify-between gap-3">

                            {/* LEFT AREA */}
                            <div className="flex flex-wrap items-center gap-3 flex-1">

                                {/* Sort */}
                                <div className="relative" >
                                    <button onClick={toggleSort} className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                                        <SortAsc size={20} className="mr-2" />
                                        <span className="hidden md:block font-medium">Sort</span>
                                    </button>
                                    <SortDropMenu
                                        isOpen={isSortOpen}
                                        onClose={handleCloseSort}
                                        sortConfig={sortConfig}
                                        onSelect={handleSortSelection}
                                        onClear={handleClearSort}
                                    />
                                </div>


                                <div className="relative flex-shrink-0">
                                    {/* Tags Button (Nút bấm để mở/đóng) */}
                                    <button
                                        onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                                        className={`flex items-center px-2 py-1 rounded-lg transition flex-shrink-0 
                ${isTagMenuOpen || filterTags.length > 0 ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'}
            `}
                                    >
                                        <span className="hidden md:block font-medium">Tags</span>
                                    </button>

                                    {/* Menu Dropdown (Chỉ hiển thị khi isTagMenuOpen là true) */}
                                    {isTagMenuOpen && (
                                        <TagDropMenu
                                            // Truyền vị trí top/left/right qua props nếu cần căn chỉnh
                                            isOpen={isTagMenuOpen}
                                            onClose={() => setIsTagMenuOpen(false)}
                                            selectedTags={filterTags}
                                            onToggleTag={handleToggleFilterTag}
                                        // Nếu bạn cần tính toán vị trí động như Card Dropdown, bạn cần thêm logic đó ở đây
                                        />
                                    )}
                                </div>

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
                    {loading ? (
                        <div className="text-center text-gray-400 mt-10">Loading bookmarks...</div>
                    ) : error ? (
                        <div className="text-center text-red-400 mt-10">Error: {error}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAndSortedDocuments.map(doc => (
                                <DocumentCard key={doc.id} card={doc} isExpanded={isExpanded} />
                            ))}
                            {filteredAndSortedDocuments.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No bookmarked documents found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}