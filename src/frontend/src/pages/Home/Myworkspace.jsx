import {
    LuArrowUpDown,
    LuTag,
    LuX,
    LuFolderPlus,
    LuFilePlus,
    LuSearch
} from 'react-icons/lu';
import { FiMoreVertical } from 'react-icons/fi';
import Sidebar from '../../components/Layout/Sidebar';
import { useUIContext } from '../../context/useUIContext';

const mockDocuments = [
    {
        id: 1,
        title: 'project 02',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: ['/dump_avt.jpg', '/dump_avt.jpg', '/dump_avt.jpg'],
        extraCount: 1
    },
    {
        id: 2,
        title: 'MML - note',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: []
    },
    {
        id: 3,
        title: 'project 01',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: []
    },
    {
        id: 4,
        title: 'Writeup CTF',
        date: '21/01/1782',
        thumbnail: '/logo.png',
        type: 'doc',
        collaborators: []
    },
    {
        id: 5,
        title: 'Writeup CTF',
        date: '21/01/1782',
        thumbnail: '/logo.png',
        type: 'doc',
        collaborators: []
    },
    {
        id: 6,
        title: 'MML - note',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: []
    },
    {
        id: 7,
        title: 'project 02',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: ['/dump_avt.jpg', '/dump_avt.jpg', '/dump_avt.jpg'],
        extraCount: 1
    },
    {
        id: 8,
        title: 'project 01',
        date: '21/01/1782',
        thumbnail: null,
        type: 'doc',
        collaborators: []
    },
];

export default function Myworkspace() {
    const { showSidebar } = useUIContext();

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-600 selection:text-white">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-64' : 'ml-0'}`}
            >
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-gray-900/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl sticky top-4 z-40 shadow-xl">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 rounded-xl text-gray-300 transition-all hover:text-white text-sm font-medium group">
                            <LuArrowUpDown className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            <span>Sort</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 rounded-xl text-gray-300 transition-all hover:text-white text-sm font-medium group">
                            <LuTag className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                            <span>Tags</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 w-full md:max-w-xl mx-4 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuSearch className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search workspace..."
                            className="block w-full pl-10 pr-10 py-2.5 border border-white/5 rounded-xl leading-5 bg-gray-950/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 sm:text-sm transition-all shadow-inner"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <LuX className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5" title="New Folder">
                            <LuFolderPlus className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5" title="New Note">
                            <LuFilePlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="group relative flex flex-col bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer h-72"
                        >
                            {/* Top Section - Content/Preview */}
                            <div className="h-3/5 relative flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent p-6 group-hover:from-white/10 transition-all">
                                {doc.thumbnail ? (
                                    <img
                                        src={doc.thumbnail}
                                        alt={doc.title}
                                        className="w-2/3 h-auto object-contain drop-shadow-2xl opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full space-y-3 opacity-30 group-hover:opacity-50 transition-opacity">
                                        <div className="h-2 w-1/3 bg-gray-400 rounded-full"></div>
                                        <div className="h-2 w-2/3 bg-gray-400 rounded-full"></div>
                                        <div className="h-2 w-full bg-gray-400 rounded-full"></div>
                                        <div className="h-2 w-1/2 bg-gray-400 rounded-full"></div>
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>

                                {/* Options Button */}
                                <button className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <FiMoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Bottom Section - Info */}
                            <div className="h-2/5 p-5 flex flex-col justify-between relative z-10">
                                <div>
                                    <h3 className="text-gray-100 font-semibold text-lg truncate group-hover:text-blue-400 transition-colors">{doc.title}</h3>
                                    <p className="text-gray-500 text-xs font-mono mt-1 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Last edited: {doc.date}
                                    </p>
                                </div>

                                {/* Collaborators */}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex -space-x-2">
                                        {doc.collaborators.length > 0 ? (
                                            <>
                                                {doc.collaborators.map((avatar, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={avatar}
                                                        alt="User"
                                                        className="w-7 h-7 rounded-full border-2 border-gray-900 ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all"
                                                    />
                                                ))}
                                                {doc.extraCount && (
                                                    <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gray-800 text-gray-300 text-[10px] flex items-center justify-center font-medium">
                                                        +{doc.extraCount}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600 italic">Private</span>
                                        )}
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                                        {doc.type}
                                    </div>
                                </div>
                            </div>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-2xl pointer-events-none transition-all"></div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}