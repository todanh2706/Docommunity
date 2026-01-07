import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MoreVertical, Clock, Calendar, MessageCircle, X } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import CommentSection from '../../components/Community/CommentSection';
import { useUIContext } from '../../context/useUIContext';
import { useCommunity } from '../../hooks/useCommunity';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { DocDetailSkeleton } from '../../components/UI/Skeleton';

export default function ViewDocument() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSidebar } = useUIContext();
    const [document, setDocument] = useState(null);
    const { viewDoc, likeDocument, unlikeDocument } = useCommunity();
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const response = await viewDoc(id);
                const data = response.data;
                // Map backend response to UI structure
                // API returns: authorName, authorId, author_avatar_url (from DocumentResponse)
                // or owner.name, owner.avatar_url (from ViewDocumentResponse)
                setDocument({
                    ...data,
                    author: {
                        id: data.owner?.id || data.authorId,
                        name: data.owner?.name || data.authorName || "Unknown",
                        avatar: data.owner?.avatar_url || data.author_avatar_url || "/dump_avt.jpg",
                        role: "Member" // Placeholder
                    },
                    stats: {
                        likes: data.likesCount || 0,
                        comments: data.commentsCount || 0
                    },
                    readTime: "5 min read", // Placeholder
                    createdAt: data.createdDate,
                    tags: data.tags || []
                });
                setIsLiked(data.isLiked);
            } catch (error) {
                console.error("Failed to fetch document:", error);
            }
        };
        if (id) fetchDoc();
    }, [id]);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await unlikeDocument(id);
                setDocument(prev => ({ ...prev, stats: { ...prev.stats, likes: prev.stats.likes - 1 } }));
                setIsLiked(false);
            } else {
                await likeDocument(id);
                setDocument(prev => ({ ...prev, stats: { ...prev.stats, likes: prev.stats.likes + 1 } }));
                setIsLiked(true);
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    // Loading Skeleton View
    if (!document) {
        return (
            <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100 overflow-hidden">
                <Sidebar />
                <main className={`transition-all duration-300 ease-in-out h-screen p-4 md:p-6 flex gap-6
                    ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
                >
                    <DocDetailSkeleton />
                    {/* Comment Skeleton (Placeholder for now) */}
                    <div className="w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hidden xl:flex flex-col animate-pulse"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100 overflow-hidden">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out h-screen p-4 md:p-6 flex gap-6
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
            >
                {/* Left Panel - Document Content */}
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto custom-scrollbar relative">
                    {/* Navigation & Actions */}
                    <div className="flex items-center justify-between mb-8 sticky top-4 z-10 py-2 px-4 bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-xl shadow-lg">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            <ArrowLeft size={20} />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                <Share2 size={20} />
                            </button>
                            {/* Comment Toggle Button */}
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className={`xl:hidden relative p-2 hover:bg-white/5 rounded-full transition-colors ${showComments ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <MessageCircle size={20} />
                                {document.stats?.comments > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {document.stats.comments}
                                    </span>
                                )}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Article Header */}
                    <div className="mb-8 border-b border-white/10 pb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                            {document.title}
                        </h1>

                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {document.tags.map(tag => (
                                    <span key={tag} className="text-sm px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={document.author.avatar || "/dump_avt.jpg"}
                                    alt={document.author.name}
                                    className="w-12 h-12 rounded-full border-2 border-blue-500/30"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/dump_avt.jpg'; }}
                                />
                                <div>
                                    <p className="font-bold text-white">{document.author.name}</p>
                                    <p className="text-sm text-blue-400">{document.author.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{document.createdAt}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{document.readTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-code:text-blue-300 prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-white/10">
                        {/* Simple rendering for now, ideally use a Markdown renderer */}
                        <div className="whitespace-pre-wrap font-sans leading-relaxed">
                            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{document.content}</Markdown>
                        </div>
                    </article>

                    {/* Floating Like Button */}
                    <div className="sticky bottom-6 flex justify-center mt-10 pointer-events-none z-10">
                        <button
                            onClick={handleLike}
                            className={`pointer-events-auto flex items-center gap-3 backdrop-blur-xl border px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-all group
                            ${isLiked ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                        >
                            <Heart size={24} className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-red-400 group-hover:fill-red-400'} transition-colors`} />
                            <span className="font-bold text-white">{document.stats?.likes || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel - Comments (Desktop) */}
                <div className="w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hidden xl:flex flex-col">
                    <CommentSection docId={id} shouldFocus={location.state?.focusComment} />
                </div>

                {/* Mobile/Tablet Comment Sidebar - Slides from Right */}
                <div className={`xl:hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 border-l border-white/10 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${showComments ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageCircle size={20} />
                                Comments ({document.stats?.comments || 0})
                            </h3>
                            <button
                                onClick={() => setShowComments(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        {/* Comment Section */}
                        <div className="flex-1 overflow-hidden p-4">
                            <CommentSection docId={id} shouldFocus={location.state?.focusComment} />
                        </div>
                    </div>
                </div>

                {/* Backdrop for sidebar */}
                {showComments && (
                    <div
                        className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                        onClick={() => setShowComments(false)}
                    />
                )}
            </main>
        </div>
    );
}
