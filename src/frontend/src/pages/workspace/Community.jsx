import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import DocCard from '../../components/Community/DocCard';
import FilterToolbar from '../../components/Layout/FilterToolbar'; // Import shared toolbar
import { useUIContext } from '../../context/useUIContext';
import { useCommunity } from '../../hooks/useCommunity';
import { useTagService } from '../../services/tagService'; // Import tag service
import { DocCardSkeleton } from '../../components/UI/Skeleton';

export default function Community() {
    // Persistent State
    const { showSidebar, communityState, setCommunityState } = useUIContext();
    const { searchValue: value, page, sortConfig, filterTags, isExpanded } = communityState;

    // Toggle view mode function
    const toggleList = () => {
        setCommunityState(prev => ({
            ...prev,
            isExpanded: !prev.isExpanded
        }));
    };

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const { viewAllDocs, likeDocument, unlikeDocument, bookmarkDocument } = useCommunity();
    const { getAllTags } = useTagService();

    // Toolbar State (Local)
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);

    const handleBookmarkToggle = async (doc) => {
        // Optimistic UI Update
        const newIsBookmarked = !doc.isBookmarked;

        setDocuments(prev => prev.map(d =>
            d.id === doc.id ? { ...d, isBookmarked: newIsBookmarked } : d
        ));

        try {
            await bookmarkDocument(doc.id);
        } catch (error) {
            console.error("Bookmark toggle failed:", error);
            // Revert on error
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, isBookmarked: doc.isBookmarked } : d
            ));
        }
    };

    // Fetch Tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await getAllTags();
                const uniqueTags = [...new Set([...tags])];
                setAvailableTags(uniqueTags);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            }
        }
        fetchTags();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    useEffect(() => {
        let isMounted = true;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // Fetch data for current page and tag filter
                const tagName = filterTags.length > 0 ? filterTags[0] : null;
                const [response] = await Promise.all([
                    viewAllDocs(page, 10, tagName, value, sortConfig.title ? 'title' : 'date', sortConfig.title === 'asc' ? 'asc' : 'desc'),
                    new Promise(resolve => setTimeout(resolve, 600)) // 600ms min loading
                ]);

                if (isMounted) {
                    const pagedData = response.data || {};
                    const newDocs = pagedData.content || [];
                    setDocuments(newDocs);
                    setTotalPages(pagedData.totalPages || 0);
                }
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDocs();

        window.scrollTo({ top: 0, behavior: 'smooth' });

        return () => { isMounted = false; };
    }, [page, filterTags, value, sortConfig]); // Re-run when page, tags, search or sort changes

    // Toolbar Handlers
    const handleSortSelection = (type, val) => {
        setCommunityState(prev => ({
            ...prev,
            sortConfig: { ...prev.sortConfig, [type]: val }
        }));
    };

    const handleClearSort = () => {
        setCommunityState(prev => ({
            ...prev,
            sortConfig: { title: null, date: null }
        }));
        setIsSortOpen(false);
    };

    const handleTagSelection = (tag) => {
        // Enforce single tag selection
        setCommunityState(prev => {
            const currentTags = prev.filterTags;
            const newTags = currentTags.includes(tag) ? [] : [tag];
            return {
                ...prev,
                filterTags: newTags,
                page: 1 // Reset to page 1
            };
        });
    };

    // Client-side Sort removed - using server document order
    const processedDocuments = documents;


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCommunityState(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleCardClick = (id) => {
        navigate(`/home/community/doc/${id}`);
    };

    const handleLikeToggle = async (doc) => {
        // Optimistic UI Update
        const isLiked = doc.isLiked;
        const newLikesCount = isLiked ? doc.likesCount - 1 : doc.likesCount + 1;
        const newIsLiked = !isLiked;

        setDocuments(prev => prev.map(d =>
            d.id === doc.id ? { ...d, likesCount: newLikesCount, isLiked: newIsLiked } : d
        ));

        try {
            if (isLiked) {
                await unlikeDocument(doc.id);
            } else {
                await likeDocument(doc.id);
            }
        } catch (error) {
            console.error("Like toggle failed:", error);
            // Revert on error
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, likesCount: doc.likesCount, isLiked: doc.isLiked } : d
            ));
        }
    };

    const handleCommentClick = (id) => {
        navigate(`/home/community/doc/${id}`, { state: { focusComment: true } });
    };

    // Render Pagination Controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const surround = 2;
        let pages = [];

        // Always show first page
        pages.push(1);

        let start = Math.max(2, page - surround);
        let end = Math.min(totalPages - 1, page + surround);

        if (start > 2) {
            pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) {
            pages.push('...');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition`}
                >
                    &lt;
                </button>

                {/* Page Numbers */}
                {pages.map((p, index) => (
                    p === '...' ? (
                        <span key={`ellipsis-${index}`} className="text-gray-500">...</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-1 rounded transition ${page === p
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {p}
                        </button>
                    )
                ))}

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition`}
                >
                    &gt;
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-row items-left justify-between min-h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8 flex-grow min-w-0
                ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}
            >
                {/* Toolbar */}
                <FilterToolbar
                    searchValue={value}
                    setSearchValue={(val) => setCommunityState(prev => ({ ...prev, searchValue: val, page: 1 }))}
                    sortConfig={sortConfig}
                    filterTags={filterTags}
                    isSortOpen={isSortOpen}
                    setIsSortOpen={setIsSortOpen}
                    isTagMenuOpen={isTagMenuOpen}
                    setIsTagMenuOpen={setIsTagMenuOpen}
                    availableTags={availableTags}
                    onSortSelection={handleSortSelection}
                    onSortClear={handleClearSort}
                    onTagSelection={handleTagSelection}
                    viewMode={isExpanded ? 'grid' : 'list'}
                    setViewMode={() => toggleList()}
                />

                {/* Feed Content */}
                <div className={isExpanded
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12 items-stretch"
                    : "space-y-6 pb-12"
                }>
                    {loading ? (
                        // Render Skeletons for initial load
                        Array.from({ length: 3 }).map((_, index) => (
                            <DocCardSkeleton key={index} />
                        ))
                    ) : processedDocuments.length > 0 ? (
                        <>
                            {processedDocuments.map((doc) => (
                                <DocCard
                                    key={doc.id}
                                    title={doc.title}
                                    content={doc.snipetContent || doc.content}
                                    author={{
                                        id: doc.owner?.id,
                                        name: doc.owner?.name,
                                        avatar: doc.owner?.avatar_url || "/dump_avt.jpg",
                                        time: new Date(doc.lastModified).toLocaleString('en-US', {
                                            timeZone: 'Asia/Bangkok',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    }}
                                    likes={doc.likesCount || 0}
                                    comments={doc.commentsCount || 0}
                                    tags={doc.tags}
                                    isLiked={doc.isLiked}
                                    isBookmarked={doc.isBookmarked}
                                    isExpanded={isExpanded}
                                    onClick={() => handleCardClick(doc.id)}
                                    onLike={() => handleLikeToggle(doc)}
                                    onComment={() => handleCommentClick(doc.id)}
                                    onBookmark={() => handleBookmarkToggle(doc)}
                                />
                            ))}

                            {/* Pagination Controls */}
                            {renderPagination()}
                        </>
                    ) : (
                        <div className="text-gray-400 text-center py-10">No documents found.</div>
                    )}
                </div>
            </main>
        </div>
    );
}