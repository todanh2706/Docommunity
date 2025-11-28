import { Header } from '../components/Layout/Header';
import { Link } from 'react-router'
import { TypeWriter } from '../components/Layout/Typewriter';
import './Home.css'


// 1. Tách Box nhỏ thành Component tái sử dụng để code gọn hơn
const FeatureCard = ({ title, description }) => (

    <div className='flex flex-col items-center justify-center z-12
                  w-full h-full p-10
                  rounded-[30px]
                  bg-white/[0.15]  
                  backdrop-blur-[7px]
                  border border-white/20                   // Viền mỏng tinh tế
                  shadow-lg hover:shadow-blue-500/20       // Shadow màu xanh nhẹ khi hover
                  transition-all duration-300 hover:-translate-y-2' // Hiệu ứng nổi lên khi hover
    >
        <img src='logo.png' alt="Logo" className="h-30 w-auto" />

        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-blue-100 text-center">{description}</p>


    </div>
);


export default function HomePage() {
    return (
        <div className='flex flex-col min-h-screen font-sans text-slate selection:bg-blue-500/30 bg-[rgb(6,4,36)] text-white'>

            {/* BACKGROUND LAYER */}
            <div className='fixed inset-0 z-[-1]'>
                <div
                    className='absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url("/homepage.png")]'

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
                <div className='absolute top-[10%] left-[10%] w-60 h-60  bg-[#325C9E] opacity-15 filter blur-xl z-0 bubble-1'></div>
                <div className='absolute bottom-[5%] right-[20%] w-96 h-96  bg-[#325C9E] opacity-20 filter blur-xl z-0 bubble-2'></div>
                <div className='absolute bottom-[30%] left-[35%] w-48 h-48  bg-[#325C9E] opacity-15 filter blur-xl z-0 bubble-3'></div>
                {/*  */}

                {/* === HERO SECTION === */}
                <div className='relative z-10 flex justify-center items-center w-full min-h-[85vh] px-4  '>

                    {/* GLASS BOX LỚN */}
                    <div className='flex flex-col lg:flex-row items-center justify-between
                          w-full max-w-6xl                // Giới hạn chiều rộng tối đa chuẩn web
                          p-8 md:p-12 gap-10 lg:gap-20    // Dùng gap thay vì margin/padding lẻ tẻ
                          rounded-[40px]
                          bg-white/[0.027]                     // Nền trong suốt nhẹ hơn
                          backdrop-blur-[15px]             // Blur mạnh hơn cho sang trọng
                          border border-white/20          // Viền kính
                          shadow-2xl shadow-black/5'
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

                            <button className='px-8 py-4 rounded-xl font-semibold text-[#062452] bg-white/90
                                     hover:bg-white hover:scale-105 transition-all shadow-lg'>
                                GO TO COMMUNITY
                            </button>
                        </div>

                    </div>
                </div>


                {/* === FEATURES SECTION (2 BOX BÊN DƯỚI) === */}
                {/* Sử dụng Grid để chia cột đều nhau */}
                <div className='relative z-10 w-full max-w-6xl px-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <FeatureCard
                            title="AI Integration"
                            description="Tích hợp trí tuệ nhân tạo giúp bạn viết code nhanh hơn, sửa lỗi thông minh hơn."

                        />
                        <FeatureCard
                            title="Open Community"
                            description="Kết nối với hàng ngàn lập trình viên, chia sẻ kiến thức và cùng nhau phát triển."

                        />
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row items-center justify-between
                          w-full max-w-6xl                // Giới hạn chiều rộng tối đa chuẩn web
                          p-8 md:p-12 gap-10 lg:gap-20    // Dùng gap thay vì margin/padding lẻ tẻ
                          rounded-[40px]
                          bg-white/[0.027]                     // Nền trong suốt nhẹ hơn
                          backdrop-blur-[15px]             // Blur mạnh hơn cho sang trọng
                          border border-white/20          // Viền kính
                          shadow-2xl shadow-black/5
                          mt-10'

                >

                    <h1>MARKDOWN EDITOR</h1>
                </div>

                <div className='m-10 underline'>
                    about us
                </div>

            </main>
        </div>
    );
}