
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

// Helper function to fix broken markdown image syntax from truncated content
const fixBrokenMarkdown = (text) => {
    if (!text) return text;

    // Remove incomplete markdown image at the end: ![...](... without closing )
    // Pattern: ![anything](url-without-closing-paren at end of string
    let fixed = text.replace(/!\[[^\]]*\]\([^)]*\.{3}$/, '');
    fixed = fixed.replace(/!\[[^\]]*\]\([^)]*$/, '');
    fixed = fixed.replace(/!\[[^\]]*$/, '');

    // Also fix incomplete links [text](url...
    fixed = fixed.replace(/\[[^\]]*\]\([^)]*$/, '');
    fixed = fixed.replace(/\[[^\]]*$/, '');

    return fixed;
};

const DocCard = ({ title, content, author, likes = 0, comments = 0, tags = [], isLiked = false, isBookmarked = false, isExpanded = true, onClick, onLike, onComment, onBookmark }) => {
    // Process content to fix broken markdown
    const processedContent = fixBrokenMarkdown(content);

    // COMPACT VIEW (Grid Mode - like Myworkspace)
    if (!isExpanded) {
        return (
            <div
                className="group relative flex flex-col bg-gray-800 rounded-lg shadow-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition duration-200 cursor-pointer"
                onClick={onClick}
            >
                {/* Content Preview Area - Fixed Height */}
                <div className="h-48 flex flex-col overflow-hidden">
                    {processedContent && processedContent.trim() ? (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                                    {processedContent}
                                </Markdown>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-gray-500 bg-gray-700">
                            <span className="text-2xl">📝</span>
                        </div>
                    )}

                    {/* Author avatar overlay */}
                    <div className="px-4 pb-2 flex items-center justify-between">
                        <div className="flex -space-x-2 overflow-hidden">
                            <img
                                src={author?.avatar || "/dump_avt.jpg"}
                                alt={author?.name}
                                className="w-6 h-6 rounded-full border-2 border-gray-800 object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/dump_avt.jpg'; }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {isBookmarked && <Bookmark size={14} className="text-yellow-400 fill-yellow-400" />}
                            {tags && tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-blue-300">
                                    {tag}
                                </span>
                            ))}
                            {tags && tags.length > 2 && (
                                <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300 border border-gray-600">
                                    +{tags.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Title & Info */}
                <div className="p-3 border-t border-gray-700">
                    <div className="flex flex-row justify-between items-center">
                        <p className="text-lg font-semibold truncate flex-1">{title}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                            <span className={`flex items-center gap-1 ${isLiked ? 'text-red-400' : ''}`}>
                                <Heart size={12} className={isLiked ? 'fill-red-400' : ''} /> {likes}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={12} /> {comments}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{author?.time}</p>
                </div>
            </div>
        );
    }

    // FULL VIEW (Feed Mode - Original)
    return (
        <div
            className="group relative flex flex-col gap-4 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg hover:shadow-2xl hover:bg-white/10 transition-all duration-300 overflow-hidden h-full"
        >
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-500"></div>

            {/* Header / Author */}
            {author && (
                <div className="flex items-center gap-3 z-10">
                    <img
                        src={author.avatar || "/dump_avt.jpg"}
                        alt={author.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/dump_avt.jpg'; }}
                    />
                    <div>
                        <Link
                            to={`/home/profile/${author.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-semibold text-white hover:text-blue-400 hover:underline transition-colors"
                        >
                            {author.name}
                        </Link>
                        <p className="text-xs text-gray-400">{author.time || 'Just now'}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="z-10 space-y-2 flex-1">
                <h3
                    onClick={onClick}
                    className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer hover:underline break-words"
                >
                    {title}
                </h3>
                <div className="text-gray-300 text-sm leading-relaxed line-clamp-3 prose prose-invert prose-sm max-w-none break-words">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>{processedContent}</Markdown>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center gap-6 mt-auto pt-4 border-t border-white/5 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onLike) onLike();
                    }}
                    className={`flex items-center gap-2 transition-colors group/btn ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                >
                    <Heart size={18} className={`group-hover/btn:fill-red-400/20 ${isLiked ? 'fill-red-400' : ''}`} />
                    <span className="text-xs font-medium">{likes}</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onComment) onComment();
                    }}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                    data-testid="comment-button"
                >
                    <MessageSquare size={18} />
                    <span className="text-xs font-medium">{comments}</span>
                </button>

                <div className="flex items-center gap-4 ml-auto">
                    {/* Bookmark Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onBookmark) onBookmark();
                        }}
                        className={`transition-colors group/btn ${isBookmarked ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                    >
                        <Bookmark size={18} className={`group-hover/btn:fill-blue-400/20 ${isBookmarked ? 'fill-blue-400' : ''}`} />
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocCard;

