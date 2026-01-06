
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const DocCard = ({ title, content, author, likes = 0, comments = 0, tags = [], isLiked = false, isBookmarked = false, onClick, onLike, onComment, onBookmark }) => {
    return (
        <div
            className="group relative flex flex-col gap-4 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg hover:shadow-2xl hover:bg-white/10 transition-all duration-300 overflow-hidden"
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
            <div className="z-10 space-y-2">
                <h3
                    onClick={onClick}
                    className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer hover:underline break-words"
                >
                    {title}
                </h3>
                <div className="text-gray-300 text-sm leading-relaxed line-clamp-3 prose prose-invert prose-sm max-w-none break-words">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</Markdown>
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
            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5 z-10">
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
