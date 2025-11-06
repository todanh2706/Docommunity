import axios from 'axios';
import { useState } from 'react';

export default function useLogin() {
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

    return { login, isLoading, error };
}