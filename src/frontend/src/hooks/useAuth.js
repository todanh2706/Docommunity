import axios from 'axios';
import { useState } from 'react';

export default function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post('/auth/login', { username, password });
            setIsLoading(false);

            // delete when deploy
            console.log('Log in successfully: ', res.data);

            return res.data;
        } catch (err) {
            setIsLoading(false);

            const errMessage = err.response?.data?.message || "An error occured!";
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
            const res = await axios.post('/auth/register', { username, password, fullname, phone, email });
            setIsLoading(false);

            // delete when deploy
            console.log('Registered successfully: ', res.data);

            return res.data;
        } catch (err) {
            setIsLoading(false);

            const errMessage = err.response?.data?.message || "An error occured!";
            setError(errMessage);
            console.error('Log in failed: ', errMessage);
            throw new Error(errMessage);
        }
    }

    return { login, register, isLoading, error };
}