import axios from 'axios';
import { useState } from 'react';

export default function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { username, password });
            setIsLoading(false);

            return res.data.message;
        } catch (err) {
            setIsLoading(false);

            const errMessage = err.response?.data?.error || "An error occured!";
            setError(errMessage);
            console.error('Log in failed: ', errMessage);
            throw new Error(errMessage);
        }
    };

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
            const res = await axios.post(`${BACKEND_URL}/api/auth/register`, { username, password, fullName: fullname, phone, email });
            setIsLoading(false);
            return res.data.message;
        } catch (err) {
            setIsLoading(false);

            const errMessage = err.response?.data?.error || "An error occured!";
            setError(errMessage);
            console.error('Registered failed: ', errMessage);
            throw new Error(errMessage);
        }
    }

    return { login, register, isLoading, error };
}