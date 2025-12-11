export const FeatureCard = ({ title, description }) => (
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
