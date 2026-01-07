import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to use authentication context.
 * 
 * This is a convenience wrapper around AuthContext for backward compatibility.
 * New code should consider using useContext(AuthContext) directly.
 * 
 * @returns {Object} Authentication context with login, logout, register, verifyAccount, resendVerification, isLoading, error, and isAuthenticated
 */
export default function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
