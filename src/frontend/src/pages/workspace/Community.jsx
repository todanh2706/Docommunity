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
    const { showSidebar } = useUIContext();
    const [value, setValue] = useState("");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const { viewAllDocs, likeDocument, unlikeDocument } = useCommunity();
    const { getAllTags } = useTagService();

    // Toolbar State
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ title: '', date: '' });
    const [filterTags, setFilterTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);

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
                    viewAllDocs(page, 10, tagName),
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
    }, [page, filterTags]); // Re-run when page or tags changes

    // Toolbar Handlers
    const handleSortSelection = (type, val) => {
        setSortConfig(prev => ({ ...prev, [type]: val }));
    };

    const handleClearSort = () => {
        setSortConfig({ title: null, date: null });
        setIsSortOpen(false);
    };

    const handleTagSelection = (tag) => {
        // Enforce single tag selection for now since backend supports one
        setFilterTags(prev => {
            if (prev.includes(tag)) {
                return []; // Toggle off
            } else {
                return [tag]; // Replace with new tag (single select behavior)
            }
        });
        setPage(1); // Reset to page 1 on filter change
    };

    // Client-side Search & Sort (Applied to items fetched from server)
    const processedDocuments = [...documents]
        .filter(doc => {
            const searchTerm = value.toLowerCase().trim();
            // Note: Server filters by Tag. Client filters by Search Term.

            const matchesSearchTerm =
                (searchTerm === "") ||
                doc.title.toLowerCase().includes(searchTerm) ||
                (doc.owner && doc.owner.name && doc.owner.name.toLowerCase().includes(searchTerm));

            return matchesSearchTerm;
        })
        .sort((a, b) => {
            if (sortConfig.date) {
                const dateA = new Date(a.lastModified || a.createdDate).getTime();
                const dateB = new Date(b.lastModified || b.createdDate).getTime();
                if (dateA !== dateB) {
                    return sortConfig.date === 'latest' ? dateB - dateA : dateA - dateB;
                }
            }
            if (sortConfig.title) {
                return sortConfig.title === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            return 0; // Default order
        });


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
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
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
            >
                {/* Toolbar */}
                <FilterToolbar
                    searchValue={value}
                    setSearchValue={setValue}
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
                    showViewToggle={false} // Disable Grid/List toggle for now as Community is Feed-only
                />

                {/* Feed Content */}
                <div className="space-y-6 pb-12">
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
                                    content={doc.snipet_content || doc.content} // Fallback if snipet not provided
                                    author={{
                                        id: doc.owner?.id,
                                        name: doc.owner?.name,
                                        avatar: "/dump_avt.jpg",
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
                                    tags={doc.tags} // Pass tags
                                    isLiked={doc.isLiked}
                                    onClick={() => handleCardClick(doc.id)}
                                    onLike={() => handleLikeToggle(doc)}
                                    onComment={() => handleCommentClick(doc.id)}
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