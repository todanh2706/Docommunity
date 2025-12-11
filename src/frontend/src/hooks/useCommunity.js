import { useApi } from './useApi';

export const useCommunity = () => {
    const { get, post, delete: del } = useApi();

    /**
     * View public documents
     * GET /documents/public?page={page}&size={size}
     */
    const viewAllDocs = async (page = 1, size = 10) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);

        const queryString = params.toString();
        const url = `/documents/public?${queryString}`;

        const response = await get(url);
        return response.data;
    };

    /**
     * Get popular documents
     * GET /documents/popular?limit={limit}
     */
    const getPopularDocs = async (limit = 4) => {
        const response = await get(`/documents/popular?limit=${limit}`);
        return response.data;
    };

    /**
     * View specific document
     * GET /documents/{docid}
     */
    const viewDoc = async (docid) => {
        const response = await get(`/documents/${docid}`);
        return response.data;
    };

    /**
     * Like a document
     * POST /documents/{id}/like
     */
    const likeDocument = async (id) => {
        const response = await post(`/documents/${id}/like`);
        return response.data;
    };

    /**
     * Unlike a document
     * DELETE /documents/{id}/like
     */
    const unlikeDocument = async (id) => {
        const response = await del(`/documents/${id}/like`);
        return response.data;
    };

    /**
     * Add a comment
     * POST /documents/{id}/comments
     */
    const addComment = async (id, content) => {
        const response = await post(`/documents/${id}/comments`, { content });
        return response.data;
    };

    /**
     * Get document comments
     * GET /documents/{id}/comments?page={page}
     */
    const getComments = async (id, page = 1) => {
        const response = await get(`/documents/${id}/comments?page=${page}`);
        return response.data;
    };

    /**
     * Reply to a comment
     * POST /comments/{id}/replies
     */
    const replyComment = async (id, content) => {
        const response = await post(`/comments/${id}/replies`, { content });
        return response.data;
    };

    return {
        viewAllDocs,
        viewDoc,
        likeDocument,
        unlikeDocument,
        addComment,
        getComments,
        replyComment,
        getPopularDocs
    };
};
