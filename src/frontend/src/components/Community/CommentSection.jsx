import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Reply, MoreHorizontal, Send } from 'lucide-react';
import { useCommunity } from '../../hooks/useCommunity';

const CommentItem = ({ comment, isReply = false, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleSendReply = () => {
        if (replyContent.trim()) {
            onReply(comment.id, replyContent);
            setReplyContent("");
            setIsReplying(false);
        }
    };

    return (
        <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-6'}`}>
            <img
                src={comment.author.avatar || "/dump_avt.jpg"}
                alt={comment.author.name}
                className={`rounded-full object-cover border border-white/10 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}
            />
            <div className="flex-1">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{comment.author.name}</span>
                        <span className="text-xs text-gray-400">{comment.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                </div>

                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors">
                        <Heart size={12} /> {comment.likes}
                    </button>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                        <Reply size={12} /> Reply
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleSendReply}
                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({ docId }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const { getComments, addComment, replyComment } = useCommunity();

    useEffect(() => {
        const fetchComments = async () => {
            if (!docId) return;
            try {
                const response = await getComments(docId);
                setComments(response.data);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            }
        };
        fetchComments();
    }, [docId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await addComment(docId, newComment);
            setComments(prev => [response.data, ...prev]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleReply = async (commentId, content) => {
        try {
            const response = await replyComment(commentId, content);
            // Optimistically update UI or re-fetch (simplified here)
            // Ideally, we'd find the comment and append the reply
            console.log("Reply added:", response.data);
            // Re-fetch for simplicity in this step
            const refresh = await getComments(docId);
            setComments(refresh.data);
        } catch (error) {
            console.error("Failed to reply:", error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Comments <span className="text-sm font-normal text-gray-400">({comments.length})</span>
            </h3>

            {/* Comment List - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
                ))}
            </div>

            {/* Input Area */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex gap-3">
                    <img
                        src="/dump_avt.jpg"
                        alt="Current User"
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add to the discussion..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-24"
                        />
                        <button
                            onClick={handleAddComment}
                            className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
