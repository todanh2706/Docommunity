// context/DocumentContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    createDocument as createDocumentAPI,
    getDocumentById,
    updateDocument,
    deleteDocument as deleteDocumentAPI,
    getAllDocument
} from '../services/documentService'; // 👈 Import các hàm Service

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    // State cho tài liệu hiện tại đang được chỉnh sửa
    const [currentDocument, setCurrentDocument] = useState(null);
    // State cho danh sách các tài liệu (dùng cho trang Workspace)
    const [listDocuments, setListDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- LOGIC GỌI SERVICE VÀ CẬP NHẬT CONTEXT ---

    // 1. Lấy danh sách tài liệu
    const fetchListDocuments = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllDocument(filters);
            setListDocuments(data);
        } catch (err) {
            setError(err.message || 'Lỗi tải danh sách tài liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Lấy chi tiết tài liệu và đặt làm tài liệu hiện tại
    const loadDocument = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDocumentById(id);
            setCurrentDocument(data);
            return data;
        } catch (err) {
            setError(err.message || 'Lỗi tải chi tiết tài liệu');
            throw err; // Ném lỗi để component biết tải thất bại
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Cập nhật nội dung tài liệu (cho Editor)
    const handleDocumentUpdate = useCallback((newData) => {

        setCurrentDocument(prev => ({ ...prev, ...newData, updated_at: new Date().toISOString() }));

    }, []);

    // 4. Lưu tài liệu vào DB
    const saveDocument = async (docId, updateData) => {
        try {
            await updateDocument(docId, updateData);
        } catch (err) {
            setError('Lỗi lưu tài liệu');
            console.log(err)
            // Xử lý hoàn tác hoặc báo lỗi cho người dùng
        }
    };


    // 5. Tạo tài liệu mới
    const createDocument = async (docData) => {
        try {
            const newDoc = await createDocumentAPI(docData);
            setListDocuments(oldList => [newDoc, ...oldList]);

            setCurrentDocument(newDoc)
        } catch (err) {
            console.error(err);
            setError("Lỗi tạo tài liệu");
        } finally {
            setLoading(false);
        }
    }

    //6. Xoá tài liệu
    const deleteDocument = async (documentId) => {
        // 1. Gửi lệnh xóa lên Server
        await deleteDocumentAPI(documentId);

        // 2. Cập nhật state cục bộ (KHÔNG GỌI LẠI FETCH)
        setListDocuments(prevList => {
            // Dùng filter để tạo mảng mới, loại bỏ item có id trùng khớp
            return prevList.filter(doc => doc.id !== documentId);
        });

        // 3. (Tùy chọn) Nếu tài liệu đang mở bị xóa, hãy đặt về null
        setCurrentDocument(prevDoc => (prevDoc && prevDoc.id === documentId ? null : prevDoc));

    }

     

    return (
        <DocumentContext.Provider
            value={{
                currentDocument,
                listDocuments,
                loading,
                error,
                fetchListDocuments,
                loadDocument,
                handleDocumentUpdate,
                createDocument,
                saveDocument,
                deleteDocument
            }}
        >
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocument = () => {
    return useContext(DocumentContext);
};