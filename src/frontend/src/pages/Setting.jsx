import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIContext } from '../context/useUIContext';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import Sidebar from "../components/Layout/Sidebar";
import { ConfirmDialog } from '../components/Layout/Dialog';
import { Settings, Edit2, Save, LogOut, Eye } from 'lucide-react';
import ProfileSection from '../components/Settings/ProfileSection';
import SecuritySection from '../components/Settings/SecuritySection';
import DangerZoneSection from '../components/Settings/DangerZoneSection';
import AISettingsSection from '../components/Settings/AISettingsSection';

// --- 3. MAIN PAGE ---
export default function SettingsPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: null,
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
    const { getUserProfile, updateUserProfile, uploadAvatar, togglePrivacy: togglePrivacyApi } = useUser();
    const { logout } = useAuth();
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const toast = useToast();

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
                    id: userData.id,
                    username: userData.username || "",
                    fullname: userData.fullname || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    bio: userData.bio || "",
                    avatar: userData.avatar_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xAnstGJRFjiZXWl2GSh15ZOLhhPJ2K6ENA&s"
                }));
                // Set privacy state from API
                setIsPrivate(userData.is_private || false);
            } catch (error) {
                // Error is already logged in the hook
            }
        };

        fetchUserData();
    }, []);

    const togglePrivacy = async () => {
        try {
            const result = await togglePrivacyApi();
            setIsPrivate(result.isPrivate);
            toast.success(`Account is now ${result.isPrivate ? 'Private' : 'Public'}`);
        } catch (error) {
            toast.error("Failed to update privacy setting");
        }
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
            setSelectedAvatarFile(file);
        }
    };

    const saveData = async () => {
        try {
            // 1. Tạo một bản sao của formData để chuẩn bị gửi đi
            let dataToSave = { ...formData };

            if (selectedAvatarFile) {
                // 2. Upload ảnh lên server để lấy URL thật
                const avatarResponse = await uploadAvatar(selectedAvatarFile);

                if (avatarResponse && avatarResponse.avatarUrl) {
                    // 3. QUAN TRỌNG: Gán URL thật từ server vào dữ liệu gửi đi
                    dataToSave.avatar = avatarResponse.avatarUrl;

                    // Cập nhật luôn vào state để UI đồng bộ (nếu cần)
                    setFormData(prev => ({ ...prev, avatar: avatarResponse.avatarUrl }));
                }
            }

            // 4. Gửi dataToSave (đã có URL ảnh thật) lên backend
            await updateUserProfile(dataToSave);

            toast.success("Profile updated successfully!");
            console.log("Dữ liệu thực tế đã lưu:", dataToSave.avatar);

            setIsEditing(false);
            setBackupData(null);
            setSelectedAvatarFile(null);
        } catch (err) {
            console.error("Failed to save data", err);
            toast.error(err.message || "Failed to update profile");
        }
    };

    const discardChanges = () => {
        if (backupData) setFormData(backupData);
        setIsEditing(false);
        setSelectedAvatarFile(null);
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
    const { deleteAccount } = useUser();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount(deletePassword);
            // Logout logic
            logout();
        } catch (err) {
            setDeleteError("Incorrect password or failed to delete.");
        }
    };

    const confirmDeleteAccount = () => {
        setIsDeleteModalOpen(true);
        setDeletePassword("");
        setDeleteError("");
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
                                onClick={() => formData.id && navigate(`/home/profile/${formData.id}`)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg 
                                bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
                            >
                                <Eye size={16} />
                                <span>View Profile</span>
                            </button>
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

                        {/* AI Features */}
                        <AISettingsSection />

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
                {...dialogConfig}
            />

            {/* DELETE ACCOUNT MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#1e1f22] border border-red-500/20 rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-red-500 mb-2">Delete Account</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            This action is permanent and cannot be undone. Please enter your password to confirm.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full bg-[#0F1623] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:outline-none transition-colors"
                                    placeholder="Enter your password"
                                />
                                {deleteError && <p className="text-red-500 text-xs mt-2">{deleteError}</p>}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={!deletePassword}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/20"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}