import React from 'react';
import { Lock, Users } from 'lucide-react';

const PrivacyToggle = ({ isPrivate, togglePrivacy }) => {
    return (
        <div
            onClick={togglePrivacy}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${isPrivate ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-800' : 'bg-green-900/20 hover:bg-green-900/30 border border-green-800'
                }`}
        >
            <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isPrivate ? 'bg-red-600' : 'bg-green-600'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 flex items-center justify-center ${isPrivate ? 'translate-x-0.5' : 'translate-x-6'
                    }`}>
                    {isPrivate ? <Lock size={14} className="text-red-600" /> : <Users size={14} className="text-green-600" />}
                </div>
            </div>

            <div className="ml-4 flex flex-col">
                <p className="font-semibold text-sm">
                    {isPrivate ? "Private Account" : "Public Account"}
                </p>
                <p className="text-xs text-gray-400">
                    {isPrivate ? "Only team members can view notes." : "Anyone can view shared notes."}
                </p>
            </div>
        </div>
    );
};

export default PrivacyToggle;
