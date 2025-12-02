import { useState } from 'react';
import { Search, Tag, Check, ArrowDownAZ, ArrowUpZA , Clock, Calendar } from 'lucide-react';

// Danh sách tag có sẵn trong hệ thống (Mock data)
const AVAILABLE_TAGS = ['security', 'mailflood', 'design', 'react', 'backend', 'frontend', 'database', 'devops', 'testing'];

export const TagDropMenu = ({ isOpen, onClose, selectedTags, onToggleTag }) => {
    const [searchTerm, setSearchTerm] = useState("");

    if (!isOpen) return null;

    // Lọc tag theo từ khóa tìm kiếm
    const filteredTags = AVAILABLE_TAGS.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Lớp phủ để đóng khi click ra ngoài */}
            <div className="fixed inset-0 z-10" onClick={onClose}></div>



            {/* Menu Dropdown */}
            <div className="absolute top-8  mt-2 w-64 bg-[#1e1f22] border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">

                {/* 1. Header & Search Bar */}
                <div className="p-3 border-b border-gray-700/50 bg-gray-800/50">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find tags..."
                            className="w-full bg-gray-900 text-gray-200 text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* 2. Scrollable Tag List */}
                <div className="max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => onToggleTag(tag)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group
                                        ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Tag size={14} className={isSelected ? 'fill-blue-400/20' : 'text-gray-500'} />
                                        <span>{tag}</span>
                                    </div>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-4 text-xs text-gray-500 italic">
                            No tags found
                        </div>
                    )}
                </div>


             

                {/* 3. Footer: Clear Filter */}
                {selectedTags.length > 0 && (
                    <div className="p-2 border-t border-gray-700/50 bg-gray-800/50">
                        <button
                            onClick={() => selectedTags.forEach(t => onToggleTag(t))} // Clear logic: toggle all selected off
                            // Hoặc truyền hàm clear riêng từ cha xuống nếu muốn tối ưu
                            className="w-full text-xs text-center text-red-400 hover:text-red-300 py-1 transition"
                        >
                            Clear selected ({selectedTags.length})
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export const SortDropMenu = ({ 
    isOpen, 
    onClose, // Hàm đóng menu
    sortConfig, // State cấu hình hiện tại
    onSelect, // Hàm xử lý khi chọn (thay cho handleSortSelection)
    onClear // Hàm xóa cấu hình
}) => {
    
    // Nếu menu không mở, không render gì cả
    if (!isOpen) return null;

    return (
        <>
            {/* Lớp phủ click outside. Dùng z-index thấp hơn menu chính */}
            <div className="fixed inset-0 z-49" onClick={onClose}></div> 

            {/* SỬA LỖI ĐỊNH VỊ: Thay thế vị trí cứng top-20 left-15 bằng top-full left-0 */}
            {/* Component này được đặt bên trong một thẻ cha có thuộc tính relative */}
            <div className="absolute top-8  mt-2 w-64 bg-[#1e1f22] border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">

                {/* GROUP 1: BY TITLE */}
                <div className="p-2 border-b border-gray-700/50">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 mb-1">By Title</div>
                    
                    {/* Option: A - Z */}
                    <button
                        onClick={() => onSelect('title', 'asc')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all group
                        ${sortConfig.title === 'asc' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}
                    `}>
                        <div className="w-5 flex-shrink-0 flex items-center justify-start">{sortConfig.title === 'asc' && <Check size={16} strokeWidth={3} />}</div>
                        <span className="flex-1 text-left font-medium">Name (A - Z)</span>
                        <ArrowDownAZ size={16} className="text-gray-500" />
                    </button>

                    {/* Option: Z - A */}
                    <button
                        onClick={() => onSelect('title', 'desc')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all group
                        ${sortConfig.title === 'desc' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}
                    `}>
                        <div className="w-5 flex-shrink-0 flex items-center justify-start">{sortConfig.title === 'desc' && <Check size={16} strokeWidth={3} />}</div>
                        <span className="flex-1 text-left font-medium">Name (Z - A)</span>
                        <ArrowUpZA size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* GROUP 2: BY DATE */}
                <div className="p-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 mb-1">By Date</div>

                    {/* Option: Latest */}
                    <button
                        onClick={() => onSelect('date', 'latest')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all group
                        ${sortConfig.date === 'latest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}
                    `}>
                        <div className="w-5 flex-shrink-0 flex items-center justify-start">{sortConfig.date === 'latest' && <Check size={16} strokeWidth={3} />}</div>
                        <span className="flex-1 text-left font-medium">Newest First</span>
                        <Clock size={16} className="text-gray-500" />
                    </button>

                    {/* Option: Oldest */}
                    <button
                        onClick={() => onSelect('date', 'oldest')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all group
                        ${sortConfig.date === 'oldest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}
                    `}>
                        <div className="w-5 flex-shrink-0 flex items-center justify-start">{sortConfig.date === 'oldest' && <Check size={16} strokeWidth={3} />}</div>
                        <span className="flex-1 text-left font-medium">Oldest First</span>
                        <Calendar size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* Option Reset (Optional) */}
                <div className="p-2 border-t border-gray-700/50 bg-gray-800/50">
                    <button
                        onClick={onClear}
                        className="w-full text-xs text-center text-gray-500 hover:text-gray-300 py-1"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </>
    );
}