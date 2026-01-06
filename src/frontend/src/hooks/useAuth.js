import { useState } from 'react';
import { useApi } from './useApi.js';
import { useNavigate } from 'react-router';

export default function useAuth() {
    const api = useApi();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/login`, { username, password });
            setIsLoading(false);

            const { accessToken, refreshToken } = res.data.data;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            return res.data.data;
        } catch (err) {
            setIsLoading(false);

            console.log("Error details:", {
                message: err.message,
                code: err.code,
                response: err.response,
                backendUrl: BACKEND_URL
            });

            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "An error occured!";
            setError(errMessage);
            console.error('Log in failed: ', errMessage);
            throw new Error(errMessage);
        }
    };

    const logout = async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    }

    const register = async (username, password, confirmPassword, fullname, phone, email) => {
        if (password !== confirmPassword) {
            const errMessage = "Passwords do not match!";
            setError(errMessage);
            console.error('Registration failed: ', errMessage);
            throw new Error(errMessage);
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/register`, { username, password, fullname, phone, email });
            setIsLoading(false);
            return res.data.message;
        } catch (err) {
            setIsLoading(false);

            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "An error occured!";
            setError(errMessage);
            console.error('Registered failed: ', errMessage);
            throw new Error(errMessage);
        }
    };

    const verifyAccount = async (email, otp) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/verify-account`, { email, otp });
            setIsLoading(false);
            return res.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Verification failed!";
            setError(errMessage);
            console.error('Verification failed: ', errMessage);
            throw new Error(errMessage);
        }
    };

    const resendVerification = async (email) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/resend-verification`, { email });
            setIsLoading(false);
            return res.data;
        } catch (err) {
            setIsLoading(false);
            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to resend code!";
            setError(errMessage);
            console.error('Resend failed: ', errMessage);
            throw new Error(errMessage);
        }
    };

    return { login, logout, register, verifyAccount, resendVerification, isLoading, error };
}