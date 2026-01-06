import { AlertTriangle } from 'lucide-react'

export const ConfirmDialog = ({
    isOpen, onClose, onConfirm, onCancel,
    title, msg,
    confirmText = "Confirm", cancelText = "Cancel",
    isDanger = false // Prop này quyết định màu Đỏ hay Xanh
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111827] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        {/* Icon đổi màu dựa trên isDanger */}
                        <div className={`p-3 rounded-full ${isDanger ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                            <AlertTriangle className={`w-6 h-6 ${isDanger ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{msg}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={() => { onCancel && onCancel(); onClose(); }}
                        data-testid="confirm-dialog-cancel"
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg transition-all
                            ${isDanger
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};