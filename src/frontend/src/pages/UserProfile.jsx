import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, UserCheck, Flag, MessageSquare, MapPin, Link as LinkIcon, Calendar, Heart, FileText, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { useUIContext } from '../context/useUIContext';
import { useUser } from '../hooks/useUser';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSidebar } = useUIContext();
    const { getPublicProfile, followUser } = useUser();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [activeTab, setActiveTab] = useState('documents');
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh when page gains focus (e.g., navigating back from Find People)
    useEffect(() => {
        const handleFocus = () => {
            setRefreshKey(prev => prev + 1);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const data = await getPublicProfile(id);
                setUser({
                    id: data.id,
                    name: data.fullname || data.username,
                    username: "@" + data.username,
                    bio: data.bio || "No bio yet.",
                    avatar: data.avatar_url || "/dump_avt.jpg",
                    joined: data.createdAt || "Member",
                    stats: {
                        documents: data.documentsCount || 0,
                        likes: data.likesCount || 0,
                        followers: data.followersCount || 0,
                        following: data.followingCount || 0,
                    },
                    activity: {
                        commentsCount: data.commentsCount || 0,
                        likesGivenCount: data.likesGivenCount || 0
                    },
                    documents: data.documents || []
                });
                setIsFollowing(data.isFollowing || false);
                setIsOwnProfile(data.isOwnProfile || false);
                setFollowersCount(data.followersCount || 0);
            } catch (err) {
                if (err.name === 'CanceledError') {
                    console.log('Request canceled', err.message);
                    return;
                }
                console.error("Failed to fetch user profile", err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id, refreshKey, location.key]);

    const handleFollow = async () => {
        try {
            const result = await followUser(user.id);
            setIsFollowing(result.isFollowing);
            setFollowersCount(prev => result.isFollowing ? prev + 1 : prev - 1);
        } catch (error) {
            console.error("Failed to follow/unfollow user", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100">
                <Sidebar />
                <main className={`flex-1 flex items-center justify-center ${showSidebar ? 'ml-64' : 'ml-0'}`}>
                    <div className="text-white">Loading profile...</div>
                </main>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100">
                <Sidebar />
                <main className={`flex-1 flex items-center justify-center ${showSidebar ? 'ml-64' : 'ml-0'}`}>
                    <div className="text-red-400">{error || "User not found"}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-left justify-between min-h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8 flex flex-col gap-8
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit px-3 py-2 rounded-lg hover:bg-white/5"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                {/* Profile Header Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 opacity-80 mb-15"></div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                                    <img src={user.avatar || "/dump_avt.jpg"} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 md:pb-2">
                                <h1 className="text-3xl font-black text-white mb-5">{user.name}</h1>
                                <p className="text-gray-400 font-mono text-sm">{user.username}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    <span className="font-semibold text-white">{followersCount}</span> followers · <span className="font-semibold text-white">{user.stats.following}</span> following
                                </p>
                            </div>

                            {/* Actions - Hide follow button for own profile */}
                            {!isOwnProfile && (
                                <div className="flex items-center gap-3 md:pb">
                                    <button
                                        onClick={handleFollow}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all 
                                        ${isFollowing
                                                ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10'
                                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserCheck size={20} />
                                                <span>Following</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                <span>Follow</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bio & Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Bio</h3>
                                    <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar size={16} />
                                    <span>{user.joined}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-black text-white">{user.stats.documents}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Documents</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{user.stats.likes}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Likes Received</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex gap-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`pb-4 border-b-2 font-bold transition-colors ${activeTab === 'documents'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={18} />
                            Documents ({user.stats.documents})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-4 border-b-2 font-bold transition-colors ${activeTab === 'activity'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Heart size={18} />
                            Activity
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.documents && user.documents.length > 0 ? (
                            user.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate(`/home/community/doc/${doc.id}`)}
                                    className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                                >
                                    {/* Content Preview with Markdown */}
                                    <div className="h-32 overflow-hidden p-4">
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <Markdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                            >
                                                {doc.snipetContent || ""}
                                            </Markdown>
                                        </div>
                                    </div>
                                    {/* Footer */}
                                    <div className="p-4 pt-0 border-t border-white/5">
                                        <h4 className="text-md font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {doc.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={14} /> {doc.likesCount || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare size={14} /> {doc.commentsCount || 0}
                                                </span>
                                            </div>
                                            {doc.tags && doc.tags.length > 0 && (
                                                <span className="text-blue-400">#{doc.tags[0]}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No public documents yet
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <Heart size={24} className="text-red-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">{user.activity.likesGivenCount}</div>
                                    <div className="text-sm text-gray-400">Likes Given</div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Total number of documents {user.name} has liked in the community.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <MessageSquare size={24} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">{user.activity.commentsCount}</div>
                                    <div className="text-sm text-gray-400">Comments Made</div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Total number of comments {user.name} has posted on documents.
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
