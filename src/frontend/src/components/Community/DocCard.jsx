
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const DocCard = ({ title, content, author, likes = 0, comments = 0, onClick }) => {
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
                    className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer hover:underline"
                >
                    {title}
                </h3>
                <div className="text-gray-300 text-sm leading-relaxed line-clamp-3 prose prose-invert prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</Markdown>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5 z-10">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group/btn">
                    <Heart size={18} className="group-hover/btn:fill-red-400/20" />
                    <span className="text-xs font-medium">{likes}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-xs font-medium">{comments}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors ml-auto">
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default DocCard;
