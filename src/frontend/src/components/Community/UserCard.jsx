import React from 'react';
import { UserPlus, UserCheck } from 'lucide-react';

const UserCard = ({ name, bio, followers, avatar, isFollowing, onFollow }) => {
    return (
        <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 group">
            <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-blue-500/50 transition-colors">
                    <img src={avatar || "/dump_avt.jpg"} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1a1b1e]"></div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 text-center">{name}</h3>
            <p className="text-sm text-gray-400 text-center mb-4 line-clamp-2 h-10">{bio}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-mono">
                <span>{followers} followers</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onFollow(e);
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${isFollowing
                        ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
            >
                {isFollowing ? (
                    <>
                        <UserCheck size={16} />
                        <span>Following</span>
                    </>
                ) : (
                    <>
                        <UserPlus size={16} />
                        <span>Follow</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default UserCard;
