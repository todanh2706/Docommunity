import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from "../components/Layout/Sidebar";
import { ConfirmDialog } from '../components/Layout/ConfirmDialog';

import {
    Settings, Edit2, Trash2, Camera, Shield, User, Mail, Save, Phone
} from 'lucide-react';

// --- 2. COMPONENT: Input Field ---
const InputField = ({ label, name, value, onChange, type = "text", disabled, icon: Icon }) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
            <div className={`relative group transition-all duration-200 ${!disabled ? 'opacity-100' : 'opacity-70'}`}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    {Icon && <Icon size={18} />}
                </div>
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full bg-[#0F1623] border 
                        ${disabled ? 'border-gray-700 text-gray-400 cursor-not-allowed' : 'border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} 
                        rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-gray-600`}
                />
            </div>
        </div>
    );
};

// --- 3. MAIN PAGE ---
export default function SettingsPage() {
    const [formData, setFormData] = useState({
        username: "toilaHinacon",
        fullname: "Hina Chono",
        email: "wibu23214@gmail.com",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s",
        phone: "0123412342314",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [backupData, setBackupData] = useState(null);

    // --- STATE QUẢN LÝ DIALOG DUY NHẤT ---
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: "",
        msg: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        isDanger: false,
        onConfirm: () => { },
        onCancel: () => { }
    });

    const fileInputRef = useRef(null);
    const formContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);

    // Dummy Data Team
    const teamMembers = [
        { id: 1, name: "Chinatsu", role: "Admin", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS0gpaQJ_6LxZpG7xljR8Iae7fvQl_eAS3Vg&s" },
        { id: 2, name: "Taiki", role: "Editor", avatar: "https://m.media-amazon.com/images/M/MV5BNGY0MjkxZWUtNzE2Zi00YmIyLTk2OWItZDE4OWUxZDhmYmM1XkEyXkFqcGc@._V1_QL75_UY281_CR31,0,500,281_.jpg" },
    ];

    // Helper: Hàm mở Dialog nhanh
    const openDialog = (config) => {
        setDialogConfig({ ...config, isOpen: true });
    };

    const closeDialog = () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
    };

    // --- CÁC HÀM XỬ LÝ LOGIC ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        if (isEditing) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
        }
    };

    const saveData = () => {
        console.log("Saving data to API:", formData);
        setIsEditing(false);
        setBackupData(null);
    };

    const discardChanges = () => {
        if (backupData) setFormData(backupData);
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setBackupData({ ...formData });
            setIsEditing(true);
        } else {
            saveData();
        }
    };

    // --- ACTION: XÓA TÀI KHOẢN ---
    const confirmDeleteAccount = () => {
        openDialog({
            title: "Deactivate Account",
            msg: "Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.",
            confirmText: "Yes, Delete It",
            cancelText: "Cancel",
            isDanger: true, // Bật màu đỏ
            onConfirm: () => {
                console.log("Account Deleted!");
                // Logic logout/redirect...
            }
        });
    };

    // --- LOGIC: CLICK OUTSIDE (UNSAVED CHANGES) ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Chỉ chạy khi đang Edit và Dialog chưa mở
            if (isEditing && !dialogConfig.isOpen) {
                const clickedInsideForm = formContainerRef.current && formContainerRef.current.contains(event.target);
                const clickedOnButton = toggleButtonRef.current && toggleButtonRef.current.contains(event.target);

                if (!clickedInsideForm && !clickedOnButton) {
                    // Mở dialog xác nhận lưu
                    openDialog({
                        title: "Unsaved Changes",
                        msg: "You have unsaved changes. Do you want to save them before leaving editing mode?",
                        confirmText: "Save & Close",
                        cancelText: "Discard Changes",
                        isDanger: false, // Màu xanh
                        onConfirm: saveData,
                        onCancel: discardChanges
                    });
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isEditing, dialogConfig.isOpen]); // Quan trọng: Thêm dialogConfig.isOpen vào dependency

    // --- RENDER ---
    return (
        <div className="flex h-screen bg-[#020611] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto p-6 md:p-12">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Settings size={28} className="text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                                <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
                            </div>
                        </div>

                        {/* Nút Edit/Save */}
                        <button
                            ref={toggleButtonRef}
                            onClick={handleEditToggle}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg
                                ${isEditing
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                                    : 'bg-[#1F2937] hover:bg-[#374151] text-gray-200 border border-gray-700'
                                }`}
                        >
                            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                        </button>
                    </div>

                    {/* Profile Section */}
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
                                <InputField label="Username" name="username" value={formData.username} onChange={handleInputChange} disabled={!isEditing} />
                                <InputField label="Email Address" name="email" type="email" icon={Mail} value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                                <InputField label="Phone number" name="phone" type="phone" icon={Phone} value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                            </div>
                        </div>
                    </div>

                    {/* Team & Danger Zone */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Security Actions (Chiếm 1 phần) */}
                        <div className="flex flex-col gap-6">
                            {/* Change Password */}
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Security</h2>
                                <div className="bg-[#0B1221] border border-gray-800 rounded-xl p-5">
                                    <p className="text-sm text-gray-400 mb-4">Protect your account with a strong password.</p>
                                    <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors">
                                        Change Password
                                    </button>
                                </div>
                            </div>


                        </div>
                        <div className="lg:col-span-2">
                            <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2"><Shield size={16} /> Team Members</h2>
                            <div className="bg-[#0B1221] border border-gray-800 rounded-xl overflow-hidden">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full bg-gray-700" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.role}</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-red-500/80 mb-3 uppercase tracking-wider">Danger Zone</h2>
                                <div className="bg-red-900/25 border border-red-900/20 rounded-xl p-5">
                                    <p className="text-sm text-red-200/60 mb-4">Once you delete your account, there is no going back.</p>
                                    <button
                                        onClick={confirmDeleteAccount}
                                        className="w-full py-2 bg-transparent hover:bg-red-900/20 text-red-500 text-sm font-medium rounded-lg border border-red-900/30 hover:border-red-500/50 transition-all"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>

                            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Read more</a>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- 4. RENDER DUY NHẤT MỘT DIALOG --- */}
            <ConfirmDialog
                isOpen={dialogConfig.isOpen}
                onClose={closeDialog}
                {...dialogConfig} // Truyền toàn bộ config (title, msg, onConfirm...) vào
            />
        </div>
    );
}