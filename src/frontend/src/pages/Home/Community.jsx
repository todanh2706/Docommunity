import { LuList, LuArrowUpDown, LuTag, LuSearch } from 'react-icons/lu';
import Sidebar from '../../components/Layout/Sidebar1';
import { useUIContext } from '../../context/useUIContext';

export default function Community() {
    const { showSidebar } = useUIContext();

    return (
        <div className="flex flex-row items-left justify-between h-screen bg-gray-950">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-64' : 'ml-0'}`}
            >
                {/* Header
                <h1 className="text-3xl font-black tracking-wider mb-8 text-white uppercase font-mono">
                    TEAM_HELLO
                </h1> */}

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 hover:bg-white/5 rounded-lg text-gray-300 transition-all text-sm font-medium">
                            <LuArrowUpDown className="w-4 h-4" />
                            <span>Sort</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 hover:bg-white/5 rounded-lg text-gray-300 transition-all text-sm font-medium">
                            <LuTag className="w-4 h-4" />
                            <span>Tags</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-500"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                            <LuSearch className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="space-y-6">
                    {/* Feed Card */}
                    <div className="bg-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src="/dump_avt.jpg"
                                alt="User"
                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                Lỗ hổng 9.8 trong React Native CLI cho phép hacker chiếm quyền máy dev chỉ với 1 request.
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                Một lỗ hổng thực thi mã từ xa nghiêm trọng vừa được phát hiện trong React Native CLI với mã CVE-2025-11953. Theo nhóm bảo mật JFrog, kẻ tấn công có thể thực thi lệnh hệ điều hành trên máy phát triển thông qua server dev, gây rủi ro cao với các dự án Re...
                            </p>
                        </div>
                    </div>

                    {/* Duplicate Card for Demo */}
                    <div className="bg-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src="/dump_avt.jpg"
                                alt="User"
                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                Another Security Vulnerability Found
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                This is a placeholder for another community post. It follows the same design pattern as the one above, ensuring consistency across the feed.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}