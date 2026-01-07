import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * 
 * - Shows loading state while checking authentication
 * - Redirects to /login if not authenticated
 * - Preserves intended destination for post-login redirect
 * - Renders children if authenticated
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useContext(AuthContext);
    const location = useLocation();

    // Show loading state while auth is being verified
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated, preserving the intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render protected content
    return children;
}
