import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { useUIContext } from '../context/useUIContext';
import UserCard from '../components/Community/UserCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export default function FindPeople() {
    const { showSidebar } = useUIContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const { getAllUsers, followUser } = useUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh when page gains focus (e.g., navigating back from User Profile)
    useEffect(() => {
        const handleFocus = () => {
            setRefreshKey(prev => prev + 1);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers(searchTerm);
                // Map backend response to component format
                setUsers(data.map(user => ({
                    id: user.id,
                    name: user.fullname || user.username,
                    bio: user.bio || "No bio yet",
                    followers: user.followers_count || 0,
                    avatar: user.avatar_url || "/dump_avt.jpg",
                    isFollowing: user.is_following || false
                })));
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [searchTerm, refreshKey, location.key]);

    const handleFollow = async (e, id) => {
        e.stopPropagation(); // Prevent navigation when clicking follow button
        try {
            const result = await followUser(id);
            setUsers(users.map(user =>
                user.id === id ? { 
                    ...user, 
                    isFollowing: result.isFollowing,
                    followers: result.isFollowing ? user.followers + 1 : user.followers - 1
                } : user
            ));
        } catch (error) {
            console.error("Failed to follow/unfollow user", error);
        }
    };

    const handleUserClick = (id) => {
        navigate(`/home/profile/${id}`);
    };

    return (
        <div className="flex flex-row items-left justify-between min-h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8 flex flex-col
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
            >
                {/* Header & Search */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Find People</h1>
                    <p className="text-gray-400 mb-8">Discover and connect with other members of the community.</p>

                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="Search by name or bio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        {searchTerm ? 'Search Results' : 'All Users'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center py-10 text-gray-500">Loading users...</div>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <div key={user.id} onClick={() => handleUserClick(user.id)} className="cursor-pointer">
                                    <UserCard
                                        {...user}
                                        onFollow={(e) => handleFollow(e, user.id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
