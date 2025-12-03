import { useState } from 'react';
import { SortAsc, Search, X } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import DocCard from '../../components/Community/DocCard';
import { useUIContext } from '../../context/useUIContext';

export default function Community() {
    const { showSidebar } = useUIContext();
    const [value, setValue] = useState("");

    return (
        <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}
            >
                {/* Header
                <h1 className="text-3xl font-black tracking-wider mb-8 text-white uppercase font-mono">
                    TEAM_HELLO
                </h1> */}

                {/* Toolbar */}
                <div className="w-full p-3 mb-6 bg-gray-800 rounded-xl shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* LEFT AREA */}
                        <div className="flex items-center gap-3 flex-1">
                            {/* Sort */}
                            <button className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                                <SortAsc size={20} className="mr-2" />
                                <span className="hidden md:block font-medium">Sort</span>
                            </button>

                            {/* Tags */}
                            <button className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                                <span className="hidden md:block font-medium">Tags</span>
                            </button>

                            {/* SEARCH BAR */}
                            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 w-full md:w-auto md:max-w-sm">
                                <Search size={14} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none w-full"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                {value && (
                                    <button onClick={() => setValue("")} className="p-1 rounded-full hover:bg-gray-600">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="space-y-6">
                    <DocCard
                        title="Lỗ hổng 9.8 trong React Native CLI cho phép hacker chiếm quyền máy dev chỉ với 1 request."
                        content="Một lỗ hổng thực thi mã từ xa nghiêm trọng vừa được phát hiện trong React Native CLI với mã CVE-2025-11953. Theo nhóm bảo mật JFrog, kẻ tấn công có thể thực thi lệnh hệ điều hành trên máy phát triển thông qua server dev, gây rủi ro cao với các dự án Re..."
                        author={{ name: "Security Team", avatar: "/dump_avt.jpg", time: "2 hours ago" }}
                        likes={128}
                        comments={32}
                    />

                    <DocCard
                        title="Another Security Vulnerability Found"
                        content="This is a placeholder for another community post. It follows the same design pattern as the one above, ensuring consistency across the feed."
                        author={{ name: "Dev Community", avatar: "/dump_avt.jpg", time: "5 hours ago" }}
                        likes={85}
                        comments={12}
                    />
                </div>
            </main>
        </div>
    );
}