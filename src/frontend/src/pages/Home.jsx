import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { LuTerminal, LuShield, LuZap, LuActivity } from 'react-icons/lu';

function Card({ icon, label, value, trend }) {
    return (
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 rounded-2xl hover:border-blue-500/30 hover:bg-gray-900/80 transition-all cursor-default group">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-gray-800 rounded-lg text-gray-300 group-hover:text-white transition-colors">
                    {icon}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-white font-mono">{value}</p>
                <p className="text-xs text-blue-400/80">{trend}</p>
            </div>
        </div>
    );
}

function ActivityItem({ user, action, target, time, warning }) {
    return (
        <li className="flex items-center gap-4 text-sm">
            <div className={`w-2 h-2 rounded-full ${warning ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <div className="flex-1">
                <p className="text-gray-300">
                    <span className="font-bold text-white">{user}</span> {action} <span className="text-blue-300 font-mono bg-blue-900/20 px-1 rounded">{target}</span>
                </p>
            </div>
            <span className="text-gray-500 text-xs font-mono whitespace-nowrap">{time}</span>
        </li>
    );
}

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-600 selection:text-white overflow:x-hidden">
            <Sidebar showSidebar={isSidebarOpen} setShowSidebar={setIsSidebarOpen} />
            {/* Main Content Wrapper - Adjusts margin based on sidebar state */}
            <main
                className={`transition-all duration-300 ease-in-out min-h-screen relative
                ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
            >
                {/* Background Decoration (Glow effects) */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 p-8 lg:p-12 max-w-7xl mx-auto">

                    {/* Header Section */}
                    <header className="mb-12 mt-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            System Online
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Docommunity Space</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light">
                            The centralized hub for your document writing needs, security relevant field, and team collaboration. Secure. Fast. Organized.
                        </p>
                    </header>

                    {/* Stats / Dashboard Grid --- CHANGE WHEN HAVE THE DATABASE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <Card
                            icon={<LuTerminal className="w-6 h-6 text-blue-400" />}
                            label="Total Documents"
                            value="128"
                            trend="+12% this week"
                        />
                        <Card
                            icon={<LuZap className="w-6 h-6 text-yellow-400" />}
                            label="System Load"
                            value="24ms"
                            trend="Optimal latency"
                        />
                        <Card
                            icon={<LuActivity className="w-6 h-6 text-green-400" />}
                            label="Team Activity"
                            value="Online"
                            trend="3/5 members active"
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Recent Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold font-mono text-gray-200 flex items-center gap-3">
                                <span className="text-blue-500">#</span> Recent Activity
                            </h2>

                            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition-colors">
                                <ul className="space-y-4">
                                    <ActivityItem
                                        user="Danh"
                                        action="deployed a new document: "
                                        target="2025 CSCV Write-ups"
                                        time="2 mins ago"
                                    />
                                    <ActivityItem
                                        user="Admin"
                                        action="create a new Notification: "
                                        target="Notification about the system renovation"
                                        time="1 hour ago"
                                        warning
                                    />
                                    <ActivityItem
                                        user="Khoa"
                                        action="created a new document:"
                                        target="XSS Vulnerability Study"
                                        time="4 hours ago"
                                    />
                                </ul>
                            </div>

                            {/* Code Snippet / Technical Concept Area */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 font-mono text-sm overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                <div className="flex items-center gap-2 mb-4 text-gray-500">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                                    <span className="ml-2">system_status.log</span>
                                </div>
                                <div className="space-y-1 text-gray-300">
                                    <p><span className="text-blue-400">root@docommunity:~$</span> hello Docommunity</p>
                                    <p><span className="text-green-400">✓</span> Hello, Danh</p>
                                    <p><span className="text-blue-400">root@docommunity:~$</span> <span className="animate-pulse">_</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Quick Actions */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold font-mono text-gray-200 flex items-center gap-3">
                                <span className="text-blue-500">/</span> Quick Access
                            </h2>
                            <div className="bg-gradient-to-b from-blue-900/20 to-gray-900/20 border border-blue-500/20 rounded-2xl p-6">
                                <h3 className="text-blue-200 font-semibold mb-2">Explore Community</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Connect with other security researchers and share your latest findings.
                                </p>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                                    Join Discussion
                                </button>
                            </div>
                            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-gray-200 font-semibold mb-2">Documentation</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Learn how to use the markdown editor and formatting tools.
                                </p>
                                <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
                                    Read Docs
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}