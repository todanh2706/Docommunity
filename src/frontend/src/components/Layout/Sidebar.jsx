import { NavLink } from 'react-router-dom';
import {
    LuChevronsLeft,
    LuPlus,
    LuFolderPlus,
    LuBookmark,
    LuTag,
    LuUsers,
    LuBox,
    LuTrash2,
    LuMenu,
} from 'react-icons/lu';
import { BsPersonWorkspace } from 'react-icons/bs';
import { useUIContext } from '../../context/useUIContext';

export default function Sidebar() {
    const { showSidebar, setShowSidebar } = useUIContext();

    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all";
    const activeClasses = "bg-blue-800 text-white";
    const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <>
            {/* Button to show the Sidebar */}
            {!showSidebar && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className='fixed top-6 left-6 z-50 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200'
                    aria-label='Open sidebar'
                >
                    <LuMenu className='w-6 h-6' />
                </button>
            )}

            {/* Sidebar Panel */}
            <div
                className={`transition-all duration-500 fixed top-0 ${showSidebar ? 'left-0' : '-left-64'
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
                    <a href='/home' className='mb-8'>
                        <img src='/logo.png' className='w-50 h-auto' alt='Logo' />
                    </a>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-2 mb-6'>
                        <button className='flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 font-mono'>
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
                            to='/home/myteam'
                            className={({ isActive }) =>
                                `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                            }
                        >
                            <LuUsers className='w-5 h-5' />
                            My team
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

                    {/* User Profile */}
                    <div className='mt-auto flex items-center gap-3 pt-6'>
                        <img
                            src='/dump_avt.jpg'
                            alt='User Avatar'
                            className='w-10 h-10 rounded-full'
                        />
                        <div>
                            <p className='font-semibold text-white font-mono'>Danh</p> {/* Username */}
                            <p className='text-sm text-gray-400 font-mono'>Flag owner</p> {/*some descriptions*/}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}