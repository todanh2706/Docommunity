import axiosInstance from '../hooks/useApi';

const BACKEND_ROOT = '/documents'; 
const USE_MOCK_DATA = false; 

// --- MOCK DATA ---
const mockCards = [
    { id: '1', title: 'Project 04', date: '2023-06-17', tags: [], isPublic: false, content: 'My name is John Cena...' },
    { id: '2', title: 'MML - Note', date: '2023-05-21', tags: [], isPublic: true, content: '' },
    { id: '3', title: 'Project 01', date: '2023-04-23', tags: ['security', 'mailflood'], isPublic: false, content: 'Nội dung tóm tắt...' },
    { id: '4', title: 'Writeup CTF', date: '2023-03-23', tags: [], isPublic: false, content: 'Nội dung tóm tắt...' },
    { id: '6', title: 'Writeup CTF Part 2', date: '2023-02-21', tags: [], isPublic: false, content: 'Nội dung tóm tắt...' },
    { id: '8', title: 'Project 02', date: '2023-09-21', tags: ['security', 'mailflood'], isPublic: false, content: 'Nội dung tóm tắt...' },
];

// Biến local tạm thời để mô phỏng Database khi dùng Mock (Reload trang sẽ mất thay đổi)
let localDocuments = [...mockCards];

// Hàm tiện ích giả lập độ trễ mạng (500ms)
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// 1. LIST OWN DOCUMENTS (GET /documents)
// ============================================================
export const getAllDocument = async (filters = {}) => {
 
    if (USE_MOCK_DATA) {
        await mockDelay();
        let results = [...localDocuments];
        
        // Giả lập lọc theo query params
        if (filters.q) {
            results = results.filter(d => d.title.toLowerCase().includes(filters.q.toLowerCase()));
        }
        if (filters.tag) {
            results = results.filter(d => d.tags.includes(filters.tag));
        }
        return results;
    }

    // Call API thật
    try {
        const response = await axiosInstance.get(`${BACKEND_ROOT}`, { params: filters });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================================
// 2. GET DOCUMENT DETAILS (GET /documents/:id)
// ============================================================
export const getDocumentById = async (id) => {
    if (USE_MOCK_DATA) {
        await mockDelay();
        const doc = localDocuments.find(d => d.id === id);
        if (!doc) throw new Error("Document not found (Mock 404)");
        return doc;
    }

    try {
        const response = await axiosInstance.get(`${BACKEND_ROOT}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================================
// 3. CREATE DOCUMENT (POST /documents)
// ============================================================
export const createDocument = async (docData) => {
    if (USE_MOCK_DATA) {
        await mockDelay();
        const newDoc = {
            id: `mock_${Date.now()}`,
            title: docData.title,
            content: docData.content || '',
            tags: docData.tags || [],
            isPublic: docData.isPublic || false,
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        };
        localDocuments.unshift(newDoc); // Thêm vào đầu danh sách
        return newDoc;
    }

    try {
        const response = await axiosInstance.post(`${BACKEND_ROOT}`, docData);
        console.log(response)
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================================
// 4. UPDATE DOCUMENT (PUT /documents/:id)
// ============================================================
export const updateDocument = async (id, docData) => {
    if (USE_MOCK_DATA) {
        await mockDelay();
        const index = localDocuments.findIndex(d => d.id === id);
        if (index === -1) throw new Error("Document not found (Mock 404)");
        
        // Update local data
        localDocuments[index] = { ...localDocuments[index], ...docData };
        return { message: "Document updated (Mock Success)" };
    }

    try {
        const response = await axiosInstance.put(`${BACKEND_ROOT}/${id}`, docData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================================
// 5. DELETE DOCUMENT (DELETE /documents/:id)
// ============================================================
export const deleteDocument = async (id) => {
    if (USE_MOCK_DATA) {
        await mockDelay();
        const initialLength = localDocuments.length;
        localDocuments = localDocuments.filter(d => d.id !== id);
        console.log(id)
        if (localDocuments.length === initialLength) {
             throw new Error("Document not found or forbidden (Mock Error)");
        }
        return true; // 204 No Content
    }

    try {
        await axiosInstance.delete(`${BACKEND_ROOT}/${id}`);
        return true;
    } catch (error) {
        throw error;
    }
};

// ============================================================
// 6. LIST PUBLIC DOCUMENTS (GET /documents/public)
// ============================================================
export const getPublicDocuments = async () => {
    if (USE_MOCK_DATA) {
        await mockDelay();
        return localDocuments.filter(d => d.isPublic);
    }

    try {
        const response = await axiosInstance.get(`${BACKEND_ROOT}/public`);
        return response.data;
    } catch (error) {
        throw error;
    }
};