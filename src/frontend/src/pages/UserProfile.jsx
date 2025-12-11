import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Flag, MessageSquare, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { useUIContext } from '../context/useUIContext';
import { useUser } from '../hooks/useUser';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSidebar } = useUIContext();
    const { getPublicProfile } = useUser();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

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
                    avatar: null, // Backend doesn't support avatar yet
                    followers: 0, // Mock for now
                    following: 0, // Mock for now
                    location: "Unknown", // Mock for now
                    website: "", // Mock for now
                    joined: "Recently", // Mock for now
                    stats: {
                        documents: 0, // Mock for now
                        likes: 0, // Mock for now
                        views: "0"
                    }
                });
                setIsFollowing(Math.random() > 0.5); // Mock following state
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
    }, [id]);

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
                {/* Profile Header Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                                    <img src={user.avatar || "/dump_avt.jpg"} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 mb-2">
                                <h1 className="text-3xl font-black text-white mb-1">{user.name}</h1>
                                <p className="text-gray-400 font-mono text-sm">{user.username}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mb-2">
                                <button className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors">
                                    <MessageSquare size={20} />
                                </button>
                                <button
                                    onClick={() => setIsFollowing(!isFollowing)}
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
                                <button className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors">
                                    <Flag size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Bio & Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">About</h3>
                                    <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                                </div>

                                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{user.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={16} />
                                        <a href="#" className="text-blue-400 hover:underline">{user.website}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Joined {user.joined}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-black text-white">{user.followers}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Followers</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{user.following}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Following</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{user.stats.documents}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Docs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs (Placeholder) */}
                <div className="flex gap-6 border-b border-white/10">
                    <button className="pb-4 border-b-2 border-blue-500 text-blue-400 font-bold">Documents</button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium transition-colors">About</button>
                    <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium transition-colors">Activity</button>
                </div>

                {/* Documents Grid (Placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-500">
                            User Document {i}
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
