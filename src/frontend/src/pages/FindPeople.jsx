import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { useUIContext } from '../context/useUIContext';
import UserCard from '../components/Community/UserCard';
import { useNavigate } from 'react-router-dom';

export default function FindPeople() {
    const { showSidebar } = useUIContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for popular users
    const [users, setUsers] = useState([
        { id: 1, name: "Sarah Connor", bio: "Full Stack Developer | React & Node.js Enthusiast", followers: "1.2k", avatar: null, isFollowing: false },
        { id: 2, name: "John Doe", bio: "UI/UX Designer | Creating beautiful experiences", followers: "850", avatar: null, isFollowing: true },
        { id: 3, name: "Jane Smith", bio: "Product Manager @ TechCorp", followers: "2.5k", avatar: null, isFollowing: false },
        { id: 4, name: "Mike Ross", bio: "Legal Tech Consultant", followers: "500", avatar: null, isFollowing: false },
        { id: 5, name: "Rachel Green", bio: "Fashion Blogger & Content Creator", followers: "10k", avatar: null, isFollowing: false },
        { id: 6, name: "Harvey Specter", bio: "Senior Partner | Closer", followers: "5.8k", avatar: null, isFollowing: true },
    ]);

    const handleFollow = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
        ));
    };

    const handleUserClick = (id) => {
        navigate(`/home/profile/${id}`);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Popular Users Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        Popular Users
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div key={user.id} onClick={() => handleUserClick(user.id)} className="cursor-pointer">
                                    <UserCard
                                        {...user}
                                        onFollow={() => handleFollow(user.id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No users found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
