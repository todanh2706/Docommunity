import React from 'react';
import { Camera, User, Mail, Phone, BadgeInfo } from 'lucide-react';
import InputField from './InputField';

const ProfileSection = ({
    formData,
    isEditing,
    handleInputChange,
    handleAvatarClick,
    handleFileChange,
    fileInputRef,
    formContainerRef
}) => {
    return (
        <div ref={formContainerRef} className={`bg-[#0B1221] border transition-colors rounded-2xl p-6 md:p-8 mb-8 shadow-sm ${isEditing ? 'border-blue-500/30' : 'border-gray-800'}`}>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 p-1 transition-colors ${isEditing ? 'border-blue-500/50 hover:border-blue-500' : 'border-gray-800'}`}>
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white w-8 h-8" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    {isEditing && <span className="text-xs text-blue-400">Click image to change</span>}
                </div>

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputField label="Full Name" name="fullname" icon={User} value={formData.fullname} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="md:col-span-2 ">
                        <InputField label="Bio" name="bio" icon={BadgeInfo} value={formData.bio} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <InputField label="Username" name="username" value={formData.username} onChange={handleInputChange} disabled={!isEditing} />
                    <InputField label="Email Address" name="email" type="email" icon={Mail} value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                    <InputField label="Phone number" name="phone" type="phone" icon={Phone} value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;
