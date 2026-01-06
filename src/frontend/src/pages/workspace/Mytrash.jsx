import Sidebar from "../../components/Layout/Sidebar";
import { ConfirmDialog } from "../../components/Layout/Dialog";
import { SortDropMenu } from "../../components/Layout/DropMenu";
import { useDocument } from '../../context/DocumentContext';
import { useState, useEffect } from 'react';
import { useUIContext } from "../../context/useUIContext";
import { Link } from "react-router";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
    Edit, SortAsc, Search, X, Grid, List, MoreVertical, EllipsisVertical, RotateCcw, Trash2, Bookmark, AlertTriangle
} from 'lucide-react';

const DocumentCard = ({ card, isExpanded, onRestore, onPermanentDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPositionClass, setMenuPositionClass] = useState("left-0 top-full mt-2");

    const toggleMenu = (e) => {
        if (!showMenu) {
            const buttonRect = e.currentTarget.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            const menuWidth = 200;
            const menuHeight = 200;

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
        confirmText: "Confirm",
        cancelText: "Cancel",
        isDanger: false,
        onConfirm: () => { },
        onCancel: () => { }
    });

    const openDialog = (config) => {
        setDialogConfig({ ...config, isOpen: true });
    };

    const closeDialog = () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const confirmRestore = () => {
        setShowMenu(false);
        openDialog({
            title: "Restore document",
            msg: "Are you sure you want to restore this document? It will be moved back to your workspace.",
            confirmText: "Yes, Restore It",
            cancelText: "Cancel",
            isDanger: false,
            onConfirm: async () => {
                try {
                    await onRestore(card.id);
                    console.log("Restored:", card.title);
                    closeDialog();
                } catch (error) {
                    console.error("Failed to restore", error);
                    alert("Cannot restore document: " + error.message);
                }
            }
        });
    };

    const confirmPermanentDelete = () => {
        setShowMenu(false);
        openDialog({
            title: "Permanently Delete",
            msg: "⚠️ This action CANNOT be undone! This document will be deleted forever.",
            confirmText: "Yes, Delete Forever",
            cancelText: "Cancel",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await onPermanentDelete(card.id);
                    console.log("Permanently deleted:", card.title);
                    closeDialog();
                } catch (error) {
                    console.error("Failed to delete permanently", error);
                    alert("Cannot delete document: " + error.message);
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isBlank = !card.content;

    return (
        <>
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-visible hover:ring-2 hover:ring-red-500 transition duration-200 relative opacity-75 hover:opacity-100">
                {/* Card Body - Disabled link in trash */}
                <div className={`${isExpanded ? 'h-64' : 'h-10'} flex flex-col ${isBlank && isExpanded ? 'bg-gray-700' : ''}`}>
                    {isBlank && isExpanded ? (
                        <div className="flex-grow flex items-center justify-center text-gray-500">
                            <Trash2 size={32} className="text-red-400" />
                        </div>
                    ) : (
                        <>
                            {isExpanded ? (() => {
                                const content = card.content || card.note || '# Deleted Document\nThis document is in trash.';
                                const truncatedContent = content.length > 400
                                    ? content.substring(0, 400) + '...'
                                    : content;

                                return (
                                    <div className="flex-1 overflow-hidden px-4 pt-4 pb-2">
                                        <div
                                            className="h-full overflow-y-auto custom-scrollbar"
                                            style={{
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: 'rgba(107, 114, 128, 0.5) transparent'
                                            }}
                                        >
                                            <style>{`
                                                .custom-scrollbar::-webkit-scrollbar {
                                                    width: 6px;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-track {
                                                    background: transparent;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                                    background: rgba(107, 114, 128, 0.3);
                                                    border-radius: 3px;
                                                    transition: background 0.2s ease;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                    background: rgba(107, 114, 128, 0.6);
                                                }
                                                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                                                    background: rgba(107, 114, 128, 0.5);
                                                }
                                            `}</style>
                                            <div className="prose prose-invert prose-sm max-w-none opacity-60">
                                                <Markdown remarkPlugins={[remarkGfm]}>
                                                    {truncatedContent}
                                                </Markdown>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : null}

                            <div className={`flex justify-between items-center ${isExpanded ? 'px-4 pb-2' : ''}`}>
                                <div className="flex -space-x-2 overflow-hidden">
                                    <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                                        <Trash2 size={14} />
                                    </div>
                                </div>

                                <div className="flex space-x-1 items-center">
                                    {card.tags && card.tags.filter(t => t !== 'TRASHED').slice(0, 2).map(tag => (
                                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                    {card.tags && card.tags.filter(t => t !== 'TRASHED').length > 2 && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 font-medium border border-gray-600">
                                            +{card.tags.filter(t => t !== 'TRASHED').length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-3 ${isExpanded ? "border-t border-gray-700" : ""}`}>
                    <div className="flex flex-row justify-between items-center relative">
                        <p className="text-lg font-semibold truncate text-gray-300">{card.title}</p>

                        <div className="relative">
                            <button
                                onClick={toggleMenu}
                                className={`hover:bg-gray-700 rounded p-1 transition ${showMenu ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                            >
                                <EllipsisVertical size={20} />
                            </button>

                            {/* Menu Popup */}
                            {showMenu && (
                                <div className={`absolute ${menuPositionClass} w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
                                    <button
                                        onClick={confirmRestore}
                                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 text-left text-sm text-green-400 transition"
                                    >
                                        <RotateCcw size={16} />
                                        <span>Restore</span>
                                    </button>

                                    <div className="h-px bg-gray-700 mx-2"></div>

                                    <button
                                        onClick={confirmPermanentDelete}
                                        className="flex items-center space-x-3 px-4 py-3 hover:bg-red-900/30 text-left text-sm text-red-400 transition"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete Forever</span>
                                    </button>
                                </div>
                            )}

                            {showMenu && (
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenu(false)}></div>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Deleted: {formatDate(card.updatedAt || card.createdAt)}</p>
                </div>
            </div>

            <ConfirmDialog
                isOpen={dialogConfig.isOpen}
                onClose={closeDialog}
                {...dialogConfig}
            />
        </>
    );
};


export default function Mytrash() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState("");
    const { showSidebar } = useUIContext();
    const { trashedList, restoreDocument, permanentDeleteDocument, fetchTrashedDocuments } = useDocument();
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        title: '',
        date: ''
    });

    // Fetch trashed documents when component mounts
    useEffect(() => {
        fetchTrashedDocuments();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter only trashed documents (if backend doesn't filter)
    const trashedDocuments = trashedList || [];

    const handleRestore = async (id) => {
        await restoreDocument(id);
    };

    const handlePermanentDelete = async (id) => {
        await permanentDeleteDocument(id);
    };

    const handleCloseSort = () => {
        setIsSortOpen(false);
    };

    const handleClearSort = () => {
        setSortConfig({ title: null, date: null });
        setIsSortOpen(false);
    };

    const toggleSort = () => {
        setIsSortOpen(!isSortOpen);
    };

    const handleSortSelection = (type, value) => {
        setSortConfig(prev => {
            return {
                ...prev,
                [type]: value
            };
        });
    };

    const toggleList = () => {
        setIsExpanded(!isExpanded);
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        return new Date(dateStr);
    };

    // Filter and sort documents
    const filteredAndSortedDocuments = [...trashedDocuments]
        .filter(doc => {
            if (!value) return true;
            return doc.title.toLowerCase().includes(value.toLowerCase());
        })
        .sort((a, b) => {
            if (sortConfig.date) {
                const dateA = parseDate(a.updatedAt || a.createdAt);
                const dateB = parseDate(b.updatedAt || b.createdAt);
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

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-red-400 flex items-center gap-2">
                            <Trash2 size={32} />
                            Trash
                        </h1>
                        <p className="text-gray-400 mt-2">Deleted documents can be restored or permanently deleted</p>
                    </div>

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

                                {/* SEARCH BAR */}
                                <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 
                            w-full md:w-auto md:max-w-sm">
                                    <Search size={14} className="text-gray-400 mr-2" />

                                    <input
                                        type="text"
                                        placeholder="Search in trash..."
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
                                    className="p-2 rounded-lg bg-red-600 text-white flex-shrink-0">
                                    {isExpanded ? <Grid size={20} /> : <List size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Empty State or Document Grid */}
                    {console.log(filteredAndSortedDocuments.length)}
                    {filteredAndSortedDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Trash2 size={64} className="mb-4 opacity-50" />
                            <p className="text-xl font-semibold">Trash is empty</p>
                            <p className="text-sm mt-2">Deleted documents will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAndSortedDocuments.map(doc => (
                                <DocumentCard
                                    key={doc.id}
                                    card={doc}
                                    isExpanded={isExpanded}
                                    onRestore={handleRestore}
                                    onPermanentDelete={handlePermanentDelete}
                                />
                            ))}
                        </div>
                    )}

                </div>

            </div>

            <SortDropMenu
                isOpen={isSortOpen}
                onClose={handleCloseSort}
                sortConfig={sortConfig}
                onSelect={handleSortSelection}
                onClear={handleClearSort}
            />

        </>
    );
}