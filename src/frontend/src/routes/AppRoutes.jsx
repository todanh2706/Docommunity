import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Bookmark from '@/pages/workspace/Bookmark';
import Tagslist from '@/pages/workspace/Tagslist';
import Myworkspace from '@/pages/workspace/Myworkspace';
import MySharedWorkspace from '@/pages/workspace/MySharedWorkspace';
import Mytrash from '@/pages/workspace/Mytrash';
import SettingsPage from '@/pages/Setting';
import EditorPage from '@/pages/EditorPage';
import Community from '@/pages/workspace/Community';
import ViewDocument from '@/pages/workspace/ViewDocument';
import FindPeople from '@/pages/FindPeople';
import UserProfile from '@/pages/UserProfile';
import VerifyAccountPage from '@/pages/Auth/VerifyAccountPage';

// Auth
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function AppRoutes() {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            {/* Public Routes - Accessible without authentication */}
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/verify-account' element={<VerifyAccountPage />} />

            {/* Protected Routes - Require authentication */}
            <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/home/bookmark' element={<ProtectedRoute><Bookmark /></ProtectedRoute>} />
            <Route path='/home/tagslist' element={<ProtectedRoute><Tagslist /></ProtectedRoute>} />
            <Route path='/home/community' element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path='/home/community/doc/:id' element={<ProtectedRoute><ViewDocument /></ProtectedRoute>} />
            <Route path='/home/find-people' element={<ProtectedRoute><FindPeople /></ProtectedRoute>} />
            <Route path='/home/profile/:id' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path='/home/myworkspace' element={<ProtectedRoute><Myworkspace /></ProtectedRoute>} />
            <Route path='/home/shared' element={<ProtectedRoute><MySharedWorkspace /></ProtectedRoute>} />
            <Route path='/home/mytrash' element={<ProtectedRoute><Mytrash /></ProtectedRoute>} />
            <Route path='/home/setting' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path='/home/editor' element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path='/share/:token' element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        </Routes>
    );
}
