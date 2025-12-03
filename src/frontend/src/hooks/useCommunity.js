import { useApi } from './useApi';

export const useCommunity = () => {
    const { get, post, delete: del } = useApi();

    /**
     * View public documents
     * GET /view-all-docs?tagid={tagid}&page={page}
     */
    const viewAllDocs = async (tagid = '', page = 1) => {
        const params = new URLSearchParams();
        if (tagid) params.append('tagid', tagid);
        if (page) params.append('page', page);

        const queryString = params.toString();
        const url = `/view-all-docs${queryString ? `?${queryString}` : ''}`;

        return await get(url);
    };

    /**
     * View specific document
     * GET /view-doc?docid={docid}
     */
    const viewDoc = async (docid) => {
        return await get(`/view-doc?docid=${docid}`);
    };

    /**
     * Like a document
     * POST /documents/{id}/like
     */
    const likeDocument = async (id) => {
        return await post(`/documents/${id}/like`);
    };

    /**
     * Unlike a document
     * DELETE /documents/{id}/like
     */
    const unlikeDocument = async (id) => {
        return await del(`/documents/${id}/like`);
    };

    /**
     * Add a comment
     * POST /documents/{id}/comments
     */
    const addComment = async (id, content) => {
        return await post(`/documents/${id}/comments`, { content });
    };

    /**
     * Get document comments
     * GET /documents/{id}/comments?page={page}
     */
    const getComments = async (id, page = 1) => {
        return await get(`/documents/${id}/comments?page=${page}`);
    };

    /**
     * Reply to a comment
     * POST /comments/{id}/replies
     */
    const replyComment = async (id, content) => {
        return await post(`/comments/${id}/replies`, { content });
    };

    return {
        viewAllDocs,
        viewDoc,
        likeDocument,
        unlikeDocument,
        addComment,
        getComments,
        replyComment
    };
};
