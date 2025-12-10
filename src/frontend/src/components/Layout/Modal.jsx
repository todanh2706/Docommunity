import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Tag, Lock as LockIcon, Globe as GlobeIcon, Settings, ChevronDown, LinkIcon, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useDocument } from '../../context/DocumentContext'; // 1. Import Context
import { suggestTags } from '../../services/AIService';
const AVAILABLE_TAGS = ['security', 'mailflood', 'design', 'react', 'backend', 'frontend', 'database', 'devops', 'testing'];

export const CreateDocumentModal = ({ isOpen, onClose }) => {
  // 2. Lấy hàm createNewDocument từ Context
  const { createDocument } = useDocument();
  const { success } = useToast();
  // State nội bộ của Modal để quản lý Form input
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: true
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', content: '', tags: '', isPublic: true });
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 3. Chuẩn bị gói dữ liệu (docData) để đưa cho Context
      const payload = {
        title: formData.title,
        content: formData.content || "", // Mặc định rỗng nếu không nhập
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isPublic: formData.isPublic === true // Đảm bảo là boolean
      };

      // 4. Gọi hàm Context (Context sẽ gọi Service -> API -> Update List)
      await createDocument(payload);
      handleCreateComment()
      // 5. Thành công: Chỉ cần đóng Modal, Context lo phần còn lại
      onClose();

    } catch (error) {
      // Nếu Context ném lỗi, bắt ở đây để hiển thị lên Modal
      console.error("Create error:", error);
      setErrorMsg(error.message || 'Không thể tạo tài liệu mới.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = () => {
    success("Create note successfully !")
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create New Note</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
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
              type="text"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Project Name..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus // Tự động focus vào ô này khi mở
            />
          </div>



          {/* Visibility Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Access Control (Privacy)</label>
            <div className="flex gap-4">
              {/* Public */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer bg-gray-800/50 border-gray-700 hover:bg-gray-700/50`}>
                <input
                  type="radio"
                  name="isPublic"
                  checked={formData.isPublic === true}
                  onChange={() => setFormData({ ...formData, isPublic: true })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <GlobeIcon size={20} className="text-green-400" />
                <span className="text-sm font-medium text-white">Public</span>
              </label>

              {/* Private */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer bg-gray-800/50 border-gray-700 hover:bg-gray-700/50`}>
                <input
                  type="radio"
                  name="isPublic"
                  checked={formData.isPublic === false}
                  onChange={() => setFormData({ ...formData, isPublic: false })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-900"
                />

                <LockIcon size={20} className="text-red-400" />
                <span className="text-sm font-medium text-white">Private</span>
              </label>
            </div>
          </div>

          {/* Actions */}
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center shadow-lg shadow-blue-900/20"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></span>}
              {loading ? 'Creating...' : 'Create Note '}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TagEditorModal = ({ isOpen, onClose, currentTags, onSave, documentContent }) => {
  // State lưu các tag đang được chọn trong modal
  const [selectedTags, setSelectedTags] = useState(currentTags);
  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Reset lại state khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTags(currentTags);
      setSearchTerm("");
      
      // Fetch AI suggestions
      if (documentContent) {
        setIsLoadingAI(true);
        suggestTags(documentContent)
          .then(data => {
            // Filter out tags that are already selected
            const suggestions = (data.tags || []).filter(t => !currentTags.includes(t));
            setAiSuggestions(suggestions);
          })
          .catch(err => console.error("Failed to fetch AI tags:", err))
          .finally(() => setIsLoadingAI(false));
      } else {
        setAiSuggestions([]);
      }
    }
  }, [isOpen, currentTags, documentContent]);

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
      // Remove from AI suggestions if present
      setAiSuggestions(prev => prev.filter(t => t !== tag));
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

          {/* Assigned Tags */}
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

          {/* AI Suggestions */}
          {(isLoadingAI || aiSuggestions.length > 0) && (
            <div>
               <label className="text-sm text-purple-400 mb-2 flex items-center gap-2">
                 <Sparkles size={14} /> AI Suggestions
               </label>
               <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-purple-900/10 rounded-lg border border-purple-500/30 border-dashed">
                 {isLoadingAI ? (
                    <span className="text-gray-500 text-sm italic p-1 flex items-center gap-2">
                      <span className="animate-spin h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full"></span>
                      Analyzing content...
                    </span>
                 ) : (
                    aiSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 hover:text-white rounded-full text-sm border border-purple-500/50 transition-all group"
                      >
                        {tag}
                        <Plus size={14} className="opacity-60 group-hover:opacity-100" />
                      </button>
                    ))
                 )}
                 {!isLoadingAI && aiSuggestions.length === 0 && (
                    <span className="text-gray-500 text-sm italic p-1">No suggestions found.</span>
                 )}
               </div>
            </div>
          )}

          {/* Search & Add New */}
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


export const DocumentSettingsModal = ({
  isOpen,
  onClose,
  currentTags,
  onSave, // Vẫn dùng onSave cho tags
  documentTitle,
  currentPrivacy,
  onUpdateInfo
}) => {

  const [selectedTags, setSelectedTags] = useState(currentTags);
  const [searchTerm, setSearchTerm] = useState("");

  const [titleState, setTitState] = useState(documentTitle);
  const [privacyState, setPrivacyState] = useState(currentPrivacy);

  // Dùng Ref để lưu trữ trạng thái trước khi đóng (Optional, nhưng tốt)
  const initialTagsRef = useRef(currentTags);

  // Reset lại state khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTags(currentTags);
      setTitState(documentTitle);
      setPrivacyState(currentPrivacy);
      setSearchTerm("");
      initialTagsRef.current = currentTags;
    }
  }, [isOpen, currentTags, documentTitle, currentPrivacy]);

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

  // Xử lý khi nhấn nút Save
  const handleSave = () => {
    // 1. Cập nhật Title và Privacy lên EditorPage ngay lập tức

    if (onUpdateInfo) {

      onUpdateInfo(titleState, privacyState);
    }

    if (JSON.stringify(initialTagsRef.current.sort()) !== JSON.stringify(selectedTags.sort())) {
      onSave(selectedTags);
    } else {
      // Nếu tags không đổi, chỉ đóng modal
      onClose();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Tag size={20} className="text-blue-400" /> Document Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Khu vực 1: Rename Document Title */}
          <div>
            <label htmlFor="document-title" className="text-sm text-gray-400 mb-2 block">Document Title</label>
            <input
              id="document-title"
              type="text"
              value={titleState}
              onChange={(e) => setTitState(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Untitled Notebook"
            />
          </div>

          {/* Khu vực 2: Set Privacy */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Access Control (Privacy)</label>
            <div className="flex gap-4">

              {/* Radio 1: Public */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${privacyState === 'public' ? 'bg-blue-900/40 border-blue-600 ring-2 ring-blue-500/50' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}`}>
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacyState === 'public'}
                  onChange={(e) => setPrivacyState(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <GlobeIcon size={20} className="text-green-400" />
                <span className="text-sm font-medium text-white">Public</span>
              </label>

              {/* Radio 2: Private */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${privacyState === 'private' ? 'bg-red-900/40 border-red-600 ring-2 ring-red-500/50' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}`}>
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacyState === 'private'}
                  onChange={(e) => setPrivacyState(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-900"
                />
                <LockIcon size={20} className="text-red-400" />
                <span className="text-sm font-medium text-white">Private</span>
              </label>
            </div>
          </div>

          {/* Khu vực 3: Tags đã assign (Cũ) */}
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


          {/* Khu vực 4: Search & Add New Tags (Cũ) */}
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
            onClick={handleSave} // Gọi hàm handleSave mới
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};



export const ShareModal = ({ isOpen, onClose, documentTitle, onCopyLink }) => {
  // Dummy data cho danh sách user
  const [collaborators, setCollaborators] = useState([
    { email: 'dhkien23@clc.fitus.edu.vn', role: 'Owner', isMe: true, avatar: null },
    { email: 'teacher@school.edu.vn', role: 'Editor', isMe: false, avatar: null }
  ]);

  const [generalAccess, setGeneralAccess] = useState('anyone'); // 'restricted' | 'anyone'
  const [inviteText, setInviteText] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (index, newRole) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators[index].role = newRole;
    setCollaborators(updatedCollaborators);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-[#1e1f22] w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">

        {/* 1. Header */}
        <div className="px-6 py-4 flex justify-between items-start">
          <h2 className="text-xl font-medium text-gray-100">
            Share "{documentTitle || 'Untitled'}"
          </h2>

        </div>

        {/* 2. Body */}
        <div className="px-6 pb-2 space-y-6">

          {/* Search/Add Input */}
          <div>
            <div className="bg-[#2b2d31] border border-gray-600 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center shadow-inner">
              <input
                type="text"
                placeholder="Add people, groups, and calendar events"
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-500 h-8"
                value={inviteText}
                onChange={(e) => setInviteText(e.target.value)}
              />
            </div>
          </div>

          {/* People with access list */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">People with access</h3>
            <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {collaborators.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center text-white font-medium text-sm">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-200 font-medium">
                        {user.isMe ? `${user.email.split('@')[0]} (you)` : user.email.split('@')[0]}
                      </span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  {/* Role Dropdown (Fake) */}
                  <div className="relative">
                    {user.isMe ? (
                      // Nếu là "Me" (Owner) thì chỉ hiện text, không cho sửa
                      <span className="text-gray-400 text-sm font-medium px-2 py-1">
                        {user.role}
                      </span>
                    ) : (
                      // Nếu là người khác thì hiện Dropdown
                      <div className="relative group flex items-center">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(idx, e.target.value)} // 'idx' lấy từ map(user, idx)
                          className="appearance-none bg-transparent text-sm font-medium text-gray-400 hover:text-gray-200 outline-none cursor-pointer py-1 pl-2 pr-6 hover:bg-white/5 rounded transition-colors"
                        >
                          <option value="Viewer" className="bg-[#1e1f22] text-gray-300 py-2">Viewer</option>
                          <option value="Editor" className="bg-[#1e1f22] text-gray-300 py-2">Editor</option>
                          <option value="Host" className="bg-[#1e1f22] text-gray-300 py-2">Host</option>
                        </select>

                        {/* Icon mũi tên giả (nằm đè lên select nhờ position absolute) */}
                        <ChevronDown
                          size={14}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Access */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">General access</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                  {generalAccess === 'anyone' ? <GlobeIcon size={18} /> : <User size={18} />}
                </div>
                <div className="flex flex-col">
                  <div className="relative group cursor-pointer flex items-center gap-1">
                    <select
                      value={generalAccess}
                      onChange={(e) => setGeneralAccess(e.target.value)}
                      className="appearance-none bg-transparent text-sm text-gray-200 font-medium outline-none cursor-pointer py-0.5 pr-4"
                    >
                      <option value="restricted" className="bg-[#1e1f22]">Restricted</option>
                      <option value="anyone" className="bg-[#1e1f22]">Anyone with the link</option>
                    </select>
                    <ChevronDown size={14} className="text-gray-400 absolute right-0 pointer-events-none" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {generalAccess === 'anyone'
                      ? 'Anyone on the internet with the link can view'
                      : 'Only people with access can open with the link'}
                  </span>
                </div>
              </div>

              {/* Permission for General Access */}
              {generalAccess === 'anyone' && (
                <div className="relative">
                  <select className="appearance-none bg-transparent text-sm text-gray-200 font-medium outline-none cursor-pointer py-1 pr-5 hover:bg-white/5 rounded pl-2">
                    <option value="viewer" className="bg-[#1e1f22]">Viewer</option>
                    <option value="editor" className="bg-[#1e1f22]">Editor</option>
                    <option value="commenter" className="bg-[#1e1f22]">Commenter</option>
                  </select>
                  <ChevronDown size={14} className="text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="px-6 py-5 mt-2 flex justify-between items-center border-t border-white/5">
          <button
            onClick={onCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-3xl border border-gray-600 text-blue-400 text-sm font-medium hover:bg-blue-500/10 hover:border-blue-500/50 transition-colors"
          >
            <LinkIcon size={16} />
            Copy link
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-3xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};