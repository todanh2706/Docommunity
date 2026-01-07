import { createContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize user state from localStorage to prevent redirect on reload
    const [user, setUser] = useState(() => {
        // Check if we have a token - if so, assume authenticated until verified
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Return a placeholder user to prevent immediate redirect
            // This will be replaced with actual user data from API
            return { _pending: true };
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useApi();
    const navigate = useNavigate();

    // Check for tokens and fetch user on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Assuming /users/me endpoint returns the user profile
                    const res = await api.get('/users/me');
                    setUser(res.data.data);
                } catch (err) {
                    console.error("Failed to fetch user profile:", err);
                    // If fetching profile fails (e.g. token expired and refresh failed), clear local storage is handled by axios interceptor usually,
                    // but we can ensure state is clear here.
                    // However, we shouldn't force logout here immediately unless we are sure.
                    // Let's rely on axios interceptor to handle 401s.
                    // If it's just a network error, we might still want to keep the user "logged in" potentially?
                    // For now, if /me fails, we assume invalid session if it's 401, but api.get throws.
                    if (err.response?.status === 401) {
                        setUser(null);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                    }
                }
            } else {
                // No token found, ensure user is null
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { username, password });
            const { accessToken, refreshToken } = res.data.data; // access data.data based on API response structure

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Fetch user profile immediately after login
            const userRes = await api.get('/users/me');
            setUser(userRes.data.data);

            navigate('/home');
            return res.data;
        } catch (err) {
            const errMessage = err.response?.data?.error || err.message || "An error occurred during login";
            setError(errMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            navigate('/login');
            setIsLoading(false);
        }
    };

    const register = async (username, password, confirmPassword, fullname, phone, email) => {
        if (password !== confirmPassword) {
            const errMessage = "Passwords do not match!";
            setError(errMessage);
            throw new Error(errMessage);
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/register`, { username, password, fullname, phone, email });
            return res.data.message;
        } catch (err) {
            const errMessage = err.response?.data?.error || "An error occured!";
            setError(errMessage);
            throw new Error(errMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const verifyAccount = async (email, otp) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/verify-account`, { email, otp });
            return res.data;
        } catch (err) {
            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Verification failed!";
            setError(errMessage);
            throw new Error(errMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async (email) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post(`/auth/resend-verification`, { email });
            return res.data;
        } catch (err) {
            const errMessage = err.response?.data?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to resend code!";
            setError(errMessage);
            throw new Error(errMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            verifyAccount,
            resendVerification,
            isLoading,
            error,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
