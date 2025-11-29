import { useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

// Create a singleton Axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Uncomment this if you want to send cookies with EVERY request (not just auth)
    timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

// Helper to process the queue of failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request Interceptor: Attach Access Token (still stored in Storage or Memory)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- AXIOS INTERCEPTOR COMPONENT ---
import { useNavigate } from 'react-router-dom';

export const AxiosInterceptor = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axiosInstance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Filter out requests that shouldn't be retried
                if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
                    return Promise.reject(error);
                }

                // Check if error is 401 and request hasn't been retried yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        // If already refreshing, add this request to the queue
                        return new Promise(function (resolve, reject) {
                            failedQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return axiosInstance(originalRequest);
                            })
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');

                        if (!refreshToken) {
                            throw new Error("No refresh token available");
                        }

                        // --- REFRESH CALL (BODY BASED) ---
                        const response = await axios.post(
                            `${BASE_URL}/auth/refresh`,
                            { refreshToken }
                        );

                        const { accessToken } = response.data;

                        // Update the Access Token in storage
                        localStorage.setItem('accessToken', accessToken);

                        // Process queue with new access token
                        processQueue(null, accessToken);

                        // Retry original request
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return axiosInstance(originalRequest);

                    } catch (refreshError) {
                        // Handle refresh failure
                        processQueue(refreshError, null);

                        // Clear tokens
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');

                        // Redirect to login using navigate
                        navigate('/login');

                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    return children;
};

// --- HOOK EXPORT ---

/**
 * Custom hook to use the configured axios instance.
 * Useful if you want to attach cleanup logic (AbortController) to components.
 */
export const useApi = () => {
    const controllers = useRef([]);

    const api = {
        get: async (url, config = {}) => {
            const controller = new AbortController();
            controllers.current.push(controller);
            try {
                return await axiosInstance.get(url, { ...config, signal: controller.signal });
            } finally {
                controllers.current = controllers.current.filter((c) => c !== controller);
            }
        },
        post: async (url, data, config = {}) => {
            const controller = new AbortController();
            controllers.current.push(controller);
            try {
                return await axiosInstance.post(url, data, { ...config, signal: controller.signal });
            } finally {
                controllers.current = controllers.current.filter((c) => c !== controller);
            }
        },
        put: async (url, data, config = {}) => {
            const controller = new AbortController();
            controllers.current.push(controller);
            try {
                return await axiosInstance.put(url, data, { ...config, signal: controller.signal });
            } finally {
                controllers.current = controllers.current.filter((c) => c !== controller);
            }
        },
        delete: async (url, config = {}) => {
            const controller = new AbortController();
            controllers.current.push(controller);
            try {
                return await axiosInstance.delete(url, { ...config, signal: controller.signal });
            } finally {
                controllers.current = controllers.current.filter((c) => c !== controller);
            }
        },
        axiosInstance
    };

    useEffect(() => {
        return () => {
            controllers.current.forEach((controller) => controller.abort());
        };
    }, []);

    return api;
};

export default axiosInstance;