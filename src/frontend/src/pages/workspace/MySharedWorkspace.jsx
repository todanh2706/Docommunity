import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import FilterToolbar from '../../components/Layout/FilterToolbar';
import { useUIContext } from '../../context/useUIContext';
import { getSharedDocuments } from '../../services/documentService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const buildSnippet = (content) => {
    if (!content) return 'No content yet.';
    
    // Remove markdown image syntax to prevent long URLs from showing
    let cleaned = content.replace(/!\[[^\]]*\]\([^)]*\)/g, '[Image]');
    // Remove markdown links but keep text
    cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    
    const max = 150;
    if (cleaned.length <= max) return cleaned;
    return `${cleaned.slice(0, max)}...`;
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const DocumentCard = ({ doc, isExpanded = true }) => {
    const tags = Array.isArray(doc.tags) ? doc.tags : [];
    const visibleTags = tags.slice(0, 2);
    const remainingCount = tags.length - 2;
    const authorName = doc.authorName || 'Unknown';
    const authorAvatar = doc.author_avatar_url || doc.authorAvatarUrl || '/dump_avt.jpg';
    const lastModified = doc.lastModified || doc.createdDate;
    const content = doc.content || '# Empty Document\nNo content yet.';
    const truncatedContent = content.length > 400 ? content.substring(0, 400) + '...' : content;
    const isBlank = !doc.content;

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-visible hover:ring-2 hover:ring-blue-500 transition duration-200 relative">
            <Link to="/home/editor" state={{ document: doc }}>
                <div className={`${isExpanded ? 'h-64' : 'h-10'} flex flex-col ${isBlank && isExpanded ? 'bg-gray-700' : ''}`}>
                    {isBlank && isExpanded ? (
                        <div className="flex-grow flex items-center justify-center text-gray-500">
                            <span className="text-2xl">📝</span>
                        </div>
                    ) : (
                        <>
                            {isExpanded && (
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
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                background: rgba(107, 114, 128, 0.6);
                                            }
                                        `}</style>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <Markdown remarkPlugins={[remarkGfm]}>
                                                {truncatedContent}
                                            </Markdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`flex justify-between items-center ${isExpanded ? 'px-4 pb-2' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <img
                                        src={authorAvatar}
                                        alt={authorName}
                                        className="w-6 h-6 rounded-full border-2 border-gray-800 object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/dump_avt.jpg'; }}
                                    />
                                </div>

                                <div className="flex space-x-1 items-center">
                                    {visibleTags.map(tag => (
                                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-blue-300">
                                            {tag}
                                        </span>
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

            {/* Footer */}
            <div className={`p-3 ${isExpanded ? "border-t border-gray-700" : ""}`}>
                <div className="flex flex-row justify-between items-center">
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold truncate">{doc.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(lastModified)}</p>
                    </div>
                    <span className="text-xs text-gray-500 truncate ml-2 max-w-[100px]">{authorName}</span>
                </div>
            </div>
        </div>
    );
};

export default function MySharedWorkspace() {
    const { showSidebar } = useUIContext();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState({ title: null, date: null });
    const [filterTags, setFilterTags] = useState([]);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        let isMounted = true;
        const fetchShared = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getSharedDocuments();
                if (!isMounted) return;
                const sharedDocs = Array.isArray(data) ? data : [];
                setDocuments(sharedDocs);
                const tags = new Set();
                sharedDocs.forEach(doc => {
                    (doc.tags || []).forEach(tag => tags.add(tag));
                });
                setAvailableTags([...tags]);
            } catch (err) {
                if (!isMounted) return;
                setError(err?.message || 'Failed to load shared documents');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchShared();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSortSelection = (type, val) => {
        setSortConfig(prev => ({
            ...prev,
            [type]: val
        }));
    };

    const handleClearSort = () => {
        setSortConfig({ title: null, date: null });
        setIsSortOpen(false);
    };

    const handleTagSelection = (tag) => {
        setFilterTags(prev => (
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        ));
    };

    const processedDocuments = useMemo(() => {
        const searchTerm = searchValue.toLowerCase().trim();
        return [...documents]
            .filter(doc => {
                const docTags = doc.tags || [];
                const matchesTags = filterTags.length === 0 || filterTags.some(tag => docTags.includes(tag));
                const matchesSearch = !searchTerm
                    || (doc.title || '').toLowerCase().includes(searchTerm)
                    || docTags.some(tag => tag.toLowerCase().includes(searchTerm));
                return matchesTags && matchesSearch;
            })
            .sort((a, b) => {
                if (sortConfig.date) {
                    const dateA = new Date(a.lastModified || a.createdDate || 0).getTime();
                    const dateB = new Date(b.lastModified || b.createdDate || 0).getTime();
                    if (dateA !== dateB) {
                        return sortConfig.date === 'latest' ? dateB - dateA : dateA - dateB;
                    }
                }
                if (sortConfig.title) {
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return sortConfig.title === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
                }
                return 0;
            });
    }, [documents, searchValue, filterTags, sortConfig]);

    return (
        <div className="flex flex-row items-left justify-between min-h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main className={`flex-grow p-6 overflow-y-auto transition-all duration-500 ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}>
                <h1 className="text-2xl font-bold mb-6">My share workspace</h1>

                <FilterToolbar
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    sortConfig={sortConfig}
                    filterTags={filterTags}
                    isSortOpen={isSortOpen}
                    setIsSortOpen={setIsSortOpen}
                    isTagMenuOpen={isTagMenuOpen}
                    setIsTagMenuOpen={setIsTagMenuOpen}
                    availableTags={availableTags}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onSortSelection={handleSortSelection}
                    onSortClear={handleClearSort}
                    onTagSelection={handleTagSelection}
                />

                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Loading shared documents...</div>
                ) : error ? (
                    <div className="text-center text-red-400 mt-10">{error}</div>
                ) : processedDocuments.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                        : 'space-y-4'
                    }>
                        {processedDocuments.map(doc => (
                            <DocumentCard key={doc.id} doc={doc} isExpanded={viewMode === 'grid'} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-10">No shared documents found.</div>
                )}
            </main>
        </div>
    );
}
