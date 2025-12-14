import { useApi } from '../hooks/useApi';

export const useTagService = () => {
    const { get } = useApi();

    const getAllTags = async () => {
        try {
            const response = await get('/tags');
            return response.data.data || [];
        } catch (error) {
            console.error("Failed to fetch tags:", error);
            return [];
        }
    };

    return {
        getAllTags
    };
};
