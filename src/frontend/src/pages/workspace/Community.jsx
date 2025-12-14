import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import DocCard from '../../components/Community/DocCard';
import CommunityToolbar from '../../components/Community/CommunityToolbar';
import { useUIContext } from '../../context/useUIContext';
import { useCommunity } from '../../hooks/useCommunity';
import { DocCardSkeleton } from '../../components/UI/Skeleton';

export default function Community() {
    const { showSidebar } = useUIContext();
    const [value, setValue] = useState("");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { viewAllDocs, likeDocument, unlikeDocument } = useCommunity();

    useEffect(() => {
        let isMounted = true;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // Fetch data with minimum loading time to prevent flicker
                const [response] = await Promise.all([
                    viewAllDocs(),
                    new Promise(resolve => setTimeout(resolve, 600)) // 600ms min loading
                ]);

                if (isMounted) {
                    setDocuments(response.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchDocs();

        return () => { isMounted = false; };
    }, []);

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

    return (
        <div className="flex flex-row items-left justify-between min-h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
            >
                {/* Header
                <h1 className="text-3xl font-black tracking-wider mb-8 text-white uppercase font-mono">
                    TEAM_HELLO
                </h1> */}

                {/* Toolbar */}
                {/* Toolbar */}
                <CommunityToolbar value={value} setValue={setValue} />

                {/* Feed Content */}
                <div className="space-y-6">
                    {loading ? (
                        // Render Skeletons
                        Array.from({ length: 3 }).map((_, index) => (
                            <DocCardSkeleton key={index} />
                        ))
                    ) : documents.length > 0 ? (
                        documents.map((doc) => (
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
                        ))
                    ) : (
                        <div className="text-gray-400 text-center py-10">No documents found.</div>
                    )}
                </div>
            </main>
        </div>
    );
}