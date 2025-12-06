import { useState } from 'react';
import { useApi } from './useApi';

export const useUser = () => {
    const api = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/users/me');
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.error || "Failed to fetch user profile";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    const updateUserProfile = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Map frontend keys to backend DTO keys
            const payload = {
                fullName: userData.fullname,
                email: userData.email,
                phone: userData.phone,
                bio: userData.bio
            };
            const response = await api.put('/users/me', payload);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.error || "Failed to update profile";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    return {
        getUserProfile,
        updateUserProfile,
        isLoading,
        error
    };
};
