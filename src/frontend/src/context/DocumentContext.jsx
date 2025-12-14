import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    createDocument as createDocumentAPI,
    getDocumentById,
    updateDocument,
    deleteDocument as deleteDocumentAPI,
    getAllDocument,
    getTrashedDocuments,
    restoreDocument as restoreDocumentAPI,
    permanentDeleteDocument as permanentDeleteDocumentAPI,
    getBookmarkedDocuments,
    bookmarkDocument as bookmarkDocumentAPI
} from '../services/documentService';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const [currentDocument, setCurrentDocument] = useState(null);
    const [listDocuments, setListDocuments] = useState([]);
    const [trashedList, setTrashedList] = useState([]);
    const [bookmarkedList, setBookmarkedList] = useState([]);
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
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Cập nhật nội dung tài liệu (cho Editor)
    const handleDocumentUpdate = useCallback(async (id, newData) => {
        if (!id) {
            console.error("Cannot update document: ID is missing.");
            return;
        }

        try {

            const response = await updateDocument(id, newData);
            console.log("Document saved successfully:", response);


            setCurrentDocument(prev => {
                if (!prev) return null;

                return {
                    ...prev,
                    ...newData,
                    updated_at: new Date().toISOString()
                };
            });


            return response;

        } catch (error) {

            console.error("Failed to save document:", error);

            throw error;
        }

    }, [setCurrentDocument]);

    // 4. Lưu tài liệu vào DB
    const saveDocument = async (docId, updateData) => {
        try {
            await updateDocument(docId, updateData);
        } catch (err) {
            setError('Lỗi lưu tài liệu');
            console.log(err)

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

    //6. Xoá tài liệu (soft delete - move to trash)
    const deleteDocument = async (documentId) => {
        await deleteDocumentAPI(documentId);
        setListDocuments(prevList => {
            return prevList.filter(doc => doc.id !== documentId);
        });

        setCurrentDocument(prevDoc => (prevDoc && prevDoc.id === documentId ? null : prevDoc));
    };

    //7. Lấy danh sách tài liệu đã xóa (trash)
    const fetchTrashedDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTrashedDocuments();
            setTrashedList(data);
        } catch (err) {
            setError(err.message || 'Failed to load trashed documents');
        } finally {
            setLoading(false);
        }
    }, []);

    //8. Khôi phục tài liệu từ trash
    const restoreDocument = async (documentId) => {
        try {
            await restoreDocumentAPI(documentId);
            // Remove from current list (trash view)
            setTrashedList(prevList => {
                return prevList.filter(doc => doc.id !== documentId);
            });
        } catch (err) {
            setError(err.message || 'Failed to restore document');
            throw err;
        }
    };

    //9. Xóa vĩnh viễn tài liệu
    const permanentDeleteDocument = async (documentId) => {
        try {
            await permanentDeleteDocumentAPI(documentId);
            // Remove from current list
            setTrashedList(prevList => {
                return prevList.filter(doc => doc.id !== documentId);
            });
        } catch (err) {
            setError(err.message || 'Failed to permanently delete document');
            throw err;
        }
    };

    //10. Lấy danh sách Bookmarks
    const fetchBookmarkedDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBookmarkedDocuments();
            setBookmarkedList(data);
        } catch (err) {
            setError(err.message || 'Failed to load bookmarked documents');
        } finally {
            setLoading(false);
        }
    }, []);

    // 11. Toggle Bookmark
    const toggleBookmark = async (docId) => {
        // Optimistic update
        const updateLists = (bookmarkStatus) => {
            setListDocuments(prev => prev.map(d => d.id === docId ? { ...d, isBookmarked: bookmarkStatus } : d));
            if (currentDocument && currentDocument.id === docId) {
                setCurrentDocument(prev => ({ ...prev, isBookmarked: bookmarkStatus }));
            }
            // If unbookmarking, remove from bookmarkedList locally
            if (!bookmarkStatus) {
                setBookmarkedList(prev => prev.filter(d => d.id !== docId));
            }
        };

        // Find doc to check current status
        const doc = listDocuments.find(d => d.id === docId) || bookmarkedList.find(d => d.id === docId) || currentDocument;
        if (!doc) return; // Should not happen if clicked from UI

        const newStatus = !doc.isBookmarked;
        updateLists(newStatus);

        try {
            await bookmarkDocumentAPI(docId);
        } catch (err) {
            console.error(err);
            // Revert
            updateLists(!newStatus);
            setError("Failed to toggle bookmark");
        }
    };



    return (
        <DocumentContext.Provider
            value={{
                currentDocument,
                listDocuments,
                trashedList,
                documents: listDocuments,
                loading,
                error,
                fetchListDocuments,
                loadDocument,
                handleDocumentUpdate,
                createDocument,
                saveDocument,
                deleteDocument,
                fetchTrashedDocuments,
                restoreDocument,
                restoreDocument,
                permanentDeleteDocument,
                fetchBookmarkedDocuments,
                bookmarkedList,
                toggleBookmark
            }}
        >
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocument = () => {
    return useContext(DocumentContext);
};