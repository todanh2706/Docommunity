import React, { useState, useEffect } from 'react';
import { X,  Search, Plus, Tag } from 'lucide-react';
import { createDocument } from '../../services/documentService'; // Import hàm vừa viết

const AVAILABLE_TAGS = ['security', 'mailflood', 'design', 'react', 'backend', 'frontend', 'database', 'devops', 'testing'];

export const CreateDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  // State form
  const [formData, setFormData] = useState({ title: '', content: '', tags: '', isPublic: true }); // **CẬP NHẬT: isPublic mặc định là true**
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Chuẩn bị dữ liệu đúng format backend yêu cầu
      const payload = {
        title: formData.title,
        content: formData.content,
        // Tách chuỗi tags thành mảng
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        isPublic: formData.isPublic 
      };

      // 2. Gọi API
      await createDocument(payload);

      // 3. Thành công
      if (onSuccess) onSuccess(); // Báo cho cha biết để reload
      setFormData({ title: '', content: '', tags: '', isPublic: true }); // Reset form
      onClose(); // Đóng modal

    } catch (error) {
      setErrorMsg(error.message || 'An error occurred during note creation.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create New Note</h3>
          {/* Giả định X đã được import từ 'lucide-react' */}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            {/* <X size={24} /> */}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
              {errorMsg}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
              placeholder="Project Name..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

         
          {/* Radio Buttons for Public/Private **PHẦN CẬP NHẬT QUAN TRỌNG** */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
            <div className="flex items-center space-x-6">
                
              {/* Public Option */}
              <div className="flex items-center">
                <input
                  id="radio-public"
                  name="isPublic"
                  type="radio"
                  checked={formData.isPublic === true}
                  onChange={() => setFormData({...formData, isPublic: true})}
                  className="h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                />
                <label htmlFor="radio-public" className="ml-2 text-sm font-medium text-gray-300">
                  Public
                </label>
              </div>

              {/* Private Option */}
              <div className="flex items-center">
                <input
                  id="radio-private"
                  name="isPublic"
                  type="radio"
                  checked={formData.isPublic === false}
                  onChange={() => setFormData({...formData, isPublic: false})}
                  className="h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                />
                <label htmlFor="radio-private" className="ml-2 text-sm font-medium text-gray-300">
                  Private
                </label>
              </div>
            </div>
          </div>
          {/* End Radio Buttons */}

          
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></span>}
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const TagEditorModal = ({ isOpen, onClose, currentTags, onSave }) => {
    // State lưu các tag đang được chọn trong modal
    const [selectedTags, setSelectedTags] = useState(currentTags);
    // State cho ô tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // Reset lại state khi mở modal
    useEffect(() => {
        if (isOpen) {
            setSelectedTags(currentTags);
            setSearchTerm("");
        }
    }, [isOpen, currentTags]);

    if (!isOpen) return null;

    // Lọc các tag gợi ý: Phải khớp từ khóa search VÀ chưa được chọn
    const filteredSuggestions = AVAILABLE_TAGS.filter(
        tag => tag.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedTags.includes(tag)
    );

    // Xử lý thêm tag (từ gợi ý hoặc tạo mới)
    const handleAddTag = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
            setSearchTerm(""); // Reset search sau khi chọn
        }
    };

    // Xử lý xóa tag
    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // Xử lý khi nhấn Enter để tạo tag mới (nếu không có trong gợi ý)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== "") {
            handleAddTag(searchTerm.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Tag size={20} className="text-blue-400" /> Edit Tags
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Khu vực 1: Tags đã assign (Có thể xóa) */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Assigned Tags</label>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            {selectedTags.length === 0 && <span className="text-gray-500 text-sm italic p-1">No tags assigned...</span>}

                            {selectedTags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm border border-blue-800/50 group">
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-400 transition ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Khu vực 2: Search & Add New */}
                    <div className="relative">
                        <label className="text-sm text-gray-400 mb-2 block">Add / Search Tags</label>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Search or create new tag..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {/* Dropdown gợi ý */}
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                                {filteredSuggestions.length > 0 ? (
                                    filteredSuggestions.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 flex items-center justify-between group"
                                        >
                                            <span>{tag}</span>
                                            <Plus size={16} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        onClick={() => handleAddTag(searchTerm)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-700 text-blue-400 italic flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Create new tag "{searchTerm}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(selectedTags)}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
