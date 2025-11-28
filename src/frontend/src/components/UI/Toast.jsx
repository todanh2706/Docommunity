import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - (100 / (duration / 10));
            });
        }, 10);

        const closeTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => {
            clearInterval(timer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all duration-300 transform";
    const typeStyles = {
        success: "bg-green-500/10 border-green-500/50 text-green-400",
        error: "bg-red-500/10 border-red-500/50 text-red-400",
        info: "bg-blue-500/10 border-blue-500/50 text-blue-400"
    };

    const animationClass = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";

    return (
        <div className={`${baseStyles} ${typeStyles[type]} ${animationClass}`}>
            <div className="text-xl">
                {type === 'success' && <CheckCircle />}
                {type === 'error' && <AlertCircle />}
                {type === 'info' && <AlertCircle />}
            </div>
            <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-sm">{message}</p>
            </div>
            <button onClick={() => setIsVisible(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <X />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default Toast;
