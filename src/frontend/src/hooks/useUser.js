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
            return response.data.data;
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
            return response.data.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.error || "Failed to update profile";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    const getPublicProfile = async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/users/${id}`);
            setIsLoading(false);
            return response.data.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.error || "Failed to fetch public profile";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    const uploadAvatar = async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/users/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setIsLoading(false);
            return response.data.data; // Expected format: { avatarUrl: "..." }
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.detail || "Failed to upload avatar";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    const deleteAccount = async (password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.delete('/users/me', {
                data: { password } // Axios requires body in 'data' field for DELETE
            });
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.detail || "Failed to delete account";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    const getAllUsers = async (search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/users', {
                params: search ? { search } : {}
            });
            setIsLoading(false);
            return response.data.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.detail || "Failed to fetch users";
            setError(errMessage);
            console.error(errMessage);
            throw err;
        }
    };

    return {
        getUserProfile,
        updateUserProfile,
        getPublicProfile,
        deleteAccount,
        uploadAvatar,
        getAllUsers,
        isLoading,
        error
    };
};
