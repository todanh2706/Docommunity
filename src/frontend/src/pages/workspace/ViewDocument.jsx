import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MoreVertical, Clock, Calendar } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import CommentSection from '../../components/Community/CommentSection';
import { useUIContext } from '../../context/useUIContext';
import { useCommunity } from '../../hooks/useCommunity';

export default function ViewDocument() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSidebar } = useUIContext();
    const [document, setDocument] = useState(null);
    const { viewDoc, likeDocument, unlikeDocument } = useCommunity();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const response = await viewDoc(id);
                setDocument(response.data);
                // Assuming backend returns if current user liked it, or we manage it locally
                // setIsLiked(response.data.isLiked); 
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

    if (!document) return <div className="text-white p-10">Loading...</div>;

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
                    <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-900/0 backdrop-blur-md z-10 py-2 -mt-2">
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

                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={document.author.avatar}
                                    alt={document.author.name}
                                    className="w-12 h-12 rounded-full border-2 border-blue-500/30"
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
                            {document.content}
                        </div>
                    </article>

                    {/* Floating Like Button */}
                    <div className="sticky bottom-6 flex justify-center mt-10 pointer-events-none">
                        <button
                            onClick={handleLike}
                            className={`pointer-events-auto flex items-center gap-3 backdrop-blur-md border px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-all group
                            ${isLiked ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                        >
                            <Heart size={24} className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-red-400 group-hover:fill-red-400'} transition-colors`} />
                            <span className="font-bold text-white">{document.stats?.likes || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel - Comments */}
                <div className="w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hidden xl:flex flex-col">
                    <CommentSection docId={id} />
                </div>
            </main>
        </div>
    );
}
