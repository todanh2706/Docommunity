import { Header } from '@/components/Layout/Header';
import { Link, useNavigate } from 'react-router-dom';
import { TypeWriter } from '../components/UI/TypeWriter';
import { Sparkles, Bot, Wand2, Zap } from 'lucide-react';
import styles from './Home.module.css';
// import PopularPostCard from '../components/Community/PopularPostCard'; // REMOVE
import DocCard from '../components/Community/DocCard'; // ADD
import { useCommunity } from '../hooks/useCommunity';
import { useEffect, useState } from 'react';

const bg_logo = "./homepage.png"

export default function HomePage() {
    const navigate = useNavigate();
    const { getPopularDocs } = useCommunity();
    const [popularDocs, setPopularDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const data = await getPopularDocs(4); // Fetch top 4
                if (data && data.data) {
                    setPopularDocs(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch popular docs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    const handleCardClick = (id) => {
        navigate(`/home/community/doc/${id}`); // Assuming this is the correct route for viewing docs
    };

    return (
        <div className='flex flex-col min-h-screen font-sans text-slate selection:bg-blue-500/30 bg-[rgb(6,4,36)] text-white'>

            {/* BACKGROUND LAYER */}
            <div className='fixed inset-0 z-[0]'>
                <div
                    className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                    // Thử dòng này để kiểm tra đường dẫn trực tiếp
                    style={{ backgroundImage: `url(${bg_logo})` }}
                />
                {/* Lớp phủ màu tối nhẹ để làm nổi bật nội dung trắng/sáng */}
                <div className="absolute inset-0 bg-[#062452]/20"></div>
            </div>

            {/* HEADER */}
            <div className='sticky top-0 z-50'>
                <Header />
            </div>

            {/* MAIN CONTENT */}
            <main className='flex flex-col items-center w-full pb-20'> {/* Padding bottom để không bị sát đáy */}


                {/* 🌟 CÁC BUBBLE CHUYỂN ĐỘNG Ở PHÍA SAU 🌟 */}
                <div className={`absolute top-[10%] left-[10%] w-60 h-60  bg-[#325C9E] opacity-15 filter blur-xl z-0 ${styles.bubble1}`}></div>
                <div className={`absolute bottom-[5%] right-[20%] w-96 h-96  bg-[#325C9E] opacity-20 filter blur-xl z-0 ${styles.bubble2}`}></div>
                <div className={`absolute bottom-[30%] left-[35%] w-48 h-48  bg-[#325C9E] opacity-15 filter blur-xl z-0 ${styles.bubble3}`}></div>
                {/*  */}

                {/* === HERO SECTION === */}
                <div className='relative z-20 flex justify-center items-center w-full min-h-[85vh] px-4  '>

                    {/* GLASS BOX LỚN */}
                    <div className='flex flex-col lg:flex-row items-center justify-between
                          w-full max-w-6xl                // Giới hạn chiều rộng tối đa chuẩn web
                          p-8 md:p-12 gap-10 lg:gap-20    // Dùng gap thay vì margin/padding lẻ tẻ
                          rounded-[40px]
                          bg-white/[0.027]                     // Nền trong suốt nhẹ hơn
                          backdrop-blur-[15px]             // Blur mạnh hơn cho sang trọng
                          border border-white/20          // Viền kính
                          shadow-2xl shadow-black/5
                          '

                    >

                        {/* CỘT TRÁI: TEXT */}
                        <div className='w-full lg:w-1/2 space-y-6 text-center lg:text-left'>

                            {/* Tiêu đề với hiệu ứng Gradient Text */}
                            <h2 className='text-5xl md:text-7xl font-extrabold tracking-tight'>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 drop-shadow-lg">
                                    DOCOMUNITY
                                </span>
                            </h2>

                            {/* Khu vực Animated Box */}
                            <div className='h-40 relative w-full overflow-hidden rounded-xl bg-black/5 border border-white/10 shadow-inner'>

                                <div className='absolute top-4 left-4 bg-[#325C9E] text-white px-3 py-1 rounded-md text-xs shadow-lg'>Example AI</div>
                                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center opacity-80'>
                                    {/* Gọi component Typewriter và truyền danh sách từ */}
                                    <h1 className='text-2xl md:text-4xl font-bold'>
                                        <TypeWriter
                                            words={["# Markdown Editor", "# AI Integrate", "# Community"]}
                                        />
                                    </h1>
                                </div>

                            </div>
                        </div>

                        {/* CỘT PHẢI: ACTIONS */}
                        <div className='w-full lg:w-1/2 flex flex-col items-center gap-10'>
                            <Link to="myworkspace" className='contents'>
                                <button className='group relative px-10 py-5 rounded-2xl font-bold text-xl text-white shadow-xl
                                     bg-gradient-to-r from-[#062452] to-[#325C9E] overflow-hidden
                                     transition-all hover:scale-105 hover:shadow-blue-500/50'>
                                    <span className="relative z-10">#WRITE NOW</span>
                                    {/* Hiệu ứng sáng bóng khi hover */}
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </Link>

                            <div className="flex items-center gap-4 w-full justify-center">
                                <div className="h-[1px] w-12 bg-white/30"></div>
                                <span className="text-white/60 font-medium text-sm">OR</span>
                                <div className="h-[1px] w-12 bg-white/30"></div>
                            </div>
                            <Link to="community">
                                <button className='px-8 py-4 rounded-xl font-semibold text-[#062452] bg-white/90
                                     hover:bg-white hover:scale-105 transition-all shadow-lg'>
                                    GO TO COMMUNITY
                                </button>
                            </Link>

                        </div>

                    </div>
                </div>

                {/* === AI FEATURES SECTION === */}
                <div className='relative z-20 w-full max-w-6xl px-4 mb-10'>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                            Supercharge with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI Power</span>
                        </h2>
                        <p className="text-blue-100/60 text-lg max-w-3xl mx-auto leading-relaxed">
                            Experience the future of documentation with Docommunity's intelligent features.
                            Write faster, smarter, and more creatively than ever before.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {/* 1. AI Refinement */}
                        <div className='group p-8 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20'>
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                <Sparkles size={32} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">AI Refinement</h3>
                            <p className="text-blue-100/50 text-sm leading-relaxed">
                                Polish your writing instantly. Use AI to fix grammar, improve tone, and make your content shine.
                            </p>
                        </div>

                        {/* 2. AI Chatbot */}
                        <div className='group p-8 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20'>
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                <Bot size={32} className="text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">AI Chatbot</h3>
                            <p className="text-blue-100/50 text-sm leading-relaxed">
                                Your intelligent assistant. Ask questions about your documents and get instant context-aware answers.
                            </p>
                        </div>

                        {/* 3. Generate Doc */}
                        <div className='group p-8 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20'>
                            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                <Wand2 size={32} className="text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">Generate Doc</h3>
                            <p className="text-blue-100/50 text-sm leading-relaxed">
                                Create content in seconds. Generate outlines, drafts, or full documents from a simple prompt.
                            </p>
                        </div>

                        {/* 4. Inline Suggestion */}
                        <div className='group p-8 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20'>
                            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                <Zap size={32} className="text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">Inline Suggestion</h3>
                            <p className="text-blue-100/50 text-sm leading-relaxed">
                                Write faster with smart completions. Get intelligent ghost-text suggestions as you type.
                            </p>
                        </div>
                    </div>
                </div>

                {/* === POPULAR POSTS SECTION === */}
                <div className='relative z-20 w-full max-w-6xl px-10 mt-20'>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Document</span>
                        </h2>
                        <button onClick={() => navigate('/home/community')} className="text-sm text-gray-400 hover:text-white transition-colors">
                            View All →
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 py-10">Loading popular posts...</div>
                    ) : popularDocs.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
                            {popularDocs.map(doc => (
                                <DocCard
                                    key={doc.id}
                                    title={doc.title}
                                    content={doc.snipetContent} // API returns 'snipetContent'
                                    author={{
                                        id: doc.owner?.id,
                                        name: doc.owner?.name,
                                        avatar: doc.owner?.avatar_url || "/dump_avt.jpg",
                                        time: new Date(doc.lastModified).toLocaleDateString('en-US')
                                    }}
                                    likes={doc.likesCount || 0}
                                    comments={doc.commentsCount || 0}
                                    onClick={() => handleCardClick(doc.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-10">No popular posts yet.</div>
                    )}
                </div>

                {/* === FOOTER === */}
                <footer className="w-full mt-20 border-t border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-white/40 text-sm">
                                © 2024 Docommunity. All rights reserved.
                            </div>
                            <div className="flex gap-6">
                                <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">About Us</Link>
                                <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                                <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}