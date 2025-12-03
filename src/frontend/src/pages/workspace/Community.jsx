import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SortAsc, Search, X } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import DocCard from '../../components/Community/DocCard';
import { useUIContext } from '../../context/useUIContext';
import { useCommunity } from '../../hooks/useCommunity';

export default function Community() {
    const { showSidebar } = useUIContext();
    const [value, setValue] = useState("");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { viewAllDocs } = useCommunity();

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await viewAllDocs();
                setDocuments(response.data);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const handleCardClick = (id) => {
        navigate(`/home/community/doc/${id}`);
    };

    return (
        <div className="flex flex-row items-left justify-between h-screen bg-gray-900 text-gray-100">
            <Sidebar />

            <main
                className={`transition-all duration-300 ease-in-out min-h-screen p-8
                ${showSidebar ? 'ml-0 md:ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}
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
                            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 w-full md:w-64">
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
                    {loading ? (
                        <div className="text-white text-center py-10">Loading community feed...</div>
                    ) : documents.length > 0 ? (
                        documents.map((doc) => (
                            <DocCard
                                key={doc.id}
                                title={doc.title}
                                content={doc.snipet_content || doc.content} // Fallback if snipet not provided
                                author={doc.owner} // Assuming owner object matches DocCard expectation or needs mapping
                                likes={doc.likesCount || 0}
                                comments={doc.commentsCount || 0}
                                onClick={() => handleCardClick(doc.id)}
                            />
                        ))
                    ) : (
                        <div className="text-gray-400 text-center py-10">No documents found.</div>
                    )}
                </div>
            </main>
        </div>
    );
}