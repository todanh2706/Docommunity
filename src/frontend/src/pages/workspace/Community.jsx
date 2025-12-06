import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import DocCard from '../../components/Community/DocCard';
import CommunityToolbar from '../../components/Community/CommunityToolbar';
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
                setDocuments(response.data.content || []);
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
                {/* Toolbar */}
                <CommunityToolbar value={value} setValue={setValue} />

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
                                author={{
                                    id: doc.authorId,
                                    name: doc.authorName,
                                    avatar: "/dump_avt.jpg",
                                    time: new Date(doc.lastModified || doc.createdDate).toLocaleString('en-US', {
                                        timeZone: 'Asia/Bangkok',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                }}
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