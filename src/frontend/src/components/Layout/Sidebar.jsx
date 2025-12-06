import { NavLink, Link } from 'react-router-dom';
import {
    LuChevronsLeft,
    LuPlus,
    LuFolderPlus,
    LuBookmark,
    LuTag,
    LuUsers,
    LuBox,
    LuTrash2,
    LuChevronRight
} from 'react-icons/lu';
import { useState, useEffect } from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import { useUIContext } from '../../context/useUIContext';
import { CreateDocumentModal } from './Modal';
import { useUser } from '../../hooks/useUser';

export default function Sidebar({ onDocumentCreated }) {
    const { showSidebar, setShowSidebar } = useUIContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { getUserProfile } = useUser();
    const [userData, setUserData] = useState({
        fullname: "User",
        bio: "Member"
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserProfile();
                setUserData({
                    fullname: data.fullname || data.username || "User",
                    bio: data.bio || "Member"
                });
            } catch (error) {
                console.error("Failed to fetch user for sidebar", error);
            }
        };
        fetchUser();
    }, []);

    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all";
    const activeClasses = "bg-blue-800 text-white";
    const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <>
            {/* Button to show the Sidebar */}
            {!showSidebar && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className='fixed top-1/2 left-0 -translate-y-1/2 z-50 text-gray-400 w-6 h-12 rounded-r-lg flex items-center justify-center bg-gray-900/50 hover:bg-blue-600/80 hover:text-white backdrop-blur-md border-y border-r border-white/10 transition-all shadow-lg'
                    aria-label='Open sidebar'
                >
                    <LuChevronRight className='w-5 h-5' />
                </button>
            )}

            {/* Backdrop for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`transition-all duration-500 fixed top-0 z-50 ${showSidebar ? 'left-0' : '-left-64'
                    }`}
            >
                <div className='flex h-screen flex-col overflow-y-auto bg-gray-900 w-64 px-4 py-8 relative'>
                    {/* Close button */}
                    <button
                        onClick={() => {
                            setShowSidebar(false);
                        }}
                        className='absolute top-6 right-2 text-gray-400 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none hover:bg-gray-700 hover:text-white'
                    >
                        <LuChevronsLeft className='w-5 h-5' />
                    </button>

                    {/* Logo */}
                    <Link to='/home' className='mb-8'>
                        <img src='/logo.png' className='w-50 h-auto' alt='Logo' />
                    </Link>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-2 mb-6'>
                        <button onClick={() => setIsModalOpen(true)} className='flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 font-mono'>
                            <LuPlus className='w-5 h-5' />
                            Add note
                        </button>
                        <button className='flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 font-mono'>
                            <LuFolderPlus className='w-5 h-5' />
                            Create folder
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className='flex flex-col gap-1 font-mono'>
                        <NavLink
                            to='/home/bookmark'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuBookmark className='w-5 h-5' />
                            Bookmark
                        </NavLink>

                        <NavLink
                            to='/home/tagslist'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuTag className='w-5 h-5' />
                            Tags list
                        </NavLink>

                        <hr className='my-3 border-gray-700' />

                        <NavLink
                            to='/home/myworkspace'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <BsPersonWorkspace className='w-5 h-5' />
                            My workspace
                        </NavLink>

                        <NavLink
                            to='/home/community'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuBox className='w-5 h-5' />
                            Community
                        </NavLink>

                        <NavLink
                            to='/home/find-people'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuUsers className='w-5 h-5' />
                            Find everyone
                        </NavLink>

                        <hr className='my-3 border-gray-700' />

                        <NavLink
                            to='/home/mytrash'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuTrash2 className='w-5 h-5' />
                            My trash
                        </NavLink>
                    </nav>
                    <Link to="/home/setting" className='contents'>
                        {/* User Profile */}
                        <div className='mt-auto flex items-center gap-3 pt-6'>
                            <img
                                src='/dump_avt.jpg'
                                alt='User Avatar'
                                className='w-10 h-10 rounded-full'
                            />
                            <div className='overflow-hidden'>
                                <p className='font-semibold text-white font-mono truncate'>{userData.fullname}</p>
                                <p className='text-sm text-gray-400 font-mono truncate'>{userData.bio}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
            <CreateDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Khi tạo thành công: 
                    // 1. Đóng modal (đã làm trong component Modal nhưng gọi lại cũng không sao)
                    setIsModalOpen(false);
                    // 2. Báo cho cha (Myworkspace) biết để load lại list
                    if (onDocumentCreated) onDocumentCreated();
                }}
            />
        </>
    );
}