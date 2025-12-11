import React, { useState, useRef, useEffect } from 'react';
import { useUIContext } from '../context/useUIContext';
import useAuth from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import Sidebar from "../components/Layout/Sidebar";
import { ConfirmDialog } from '../components/Layout/Dialog';
import { Settings, Edit2, Save, LogOut } from 'lucide-react';
import ProfileSection from '../components/Settings/ProfileSection';
import SecuritySection from '../components/Settings/SecuritySection';
import DangerZoneSection from '../components/Settings/DangerZoneSection';

// --- 3. MAIN PAGE ---
export default function SettingsPage() {
    const [formData, setFormData] = useState({
        username: "toilaHinacon",
        fullname: "Hina Chono",
        email: "wibu23214@gmail.com",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s",
        phone: "0123412342314",
        bio: "hello, i love computer science!!!"
    });
    const { showSidebar } = useUIContext();
    const [isEditing, setIsEditing] = useState(false);
    const [backupData, setBackupData] = useState(null);
    const { getUserProfile, updateUserProfile } = useUser();
    const { logout } = useAuth();

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

    // / --- STATE QUẢN LÝ PRIVACY ---
    const [isPrivate, setIsPrivate] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getUserProfile();
                setFormData(prev => ({
                    ...prev,
                    username: userData.username || "",
                    fullname: userData.fullname || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    bio: userData.bio || ""
                }));
            } catch (error) {
                // Error is already logged in the hook
            }
        };

        fetchUserData();
    }, []);

    const togglePrivacy = () => {
        setIsPrivate((prev) => !prev);
        // TODO: Gọi API để lưu trạng thái mới vào DB
        console.log(`Privacy set to: ${!isPrivate ? 'Private' : 'Public'}`);
    };


    const fileInputRef = useRef(null);
    const formContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);


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

    const saveData = async () => {
        try {
            await updateUserProfile(formData);
            console.log("Data saved successfully");
            setIsEditing(false);
            setBackupData(null);
        } catch (error) {
            console.error("Failed to save data", error);
            // Optionally show an error toast here
        }
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

            <main className={`flex-1  overflow-y-auto w-full transition-all duration-500 ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}>
                <div className="max-w-4xl mx-auto p-6 md:p-12">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Settings size={28} className="text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                                <p className="text-gray-400 text-sm"> {!showSidebar && "Manage your profile and preferences"}</p>
                            </div>
                        </div>

                        {/* Nút Edit/Save & Sign Out */}
                        <div className="flex gap-3">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg 
                                bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                            >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>

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
                    </div>

                    {/* Profile Section */}
                    <ProfileSection
                        formData={formData}
                        isEditing={isEditing}
                        handleInputChange={handleInputChange}
                        handleAvatarClick={handleAvatarClick}
                        handleFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                        formContainerRef={formContainerRef}
                    />

                    {/* Team & Danger Zone */}
                    <div className="grid grid-cols-1 gap-8 mb-8 w-full">
                        {/* Security Actions */}
                        <SecuritySection
                            isPrivate={isPrivate}
                            togglePrivacy={togglePrivacy}
                        />

                        {/* Danger Zone */}
                        <DangerZoneSection
                            onDelete={confirmDeleteAccount}
                        />
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