import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Bookmark from '@/pages/workspace/Bookmark';
import Tagslist from '@/pages/workspace/Tagslist';
import Myworkspace from '@/pages/workspace/Myworkspace';
import Mytrash from '@/pages/workspace/Mytrash';
import SettingsPage from '@/pages/Setting';
import EditorPage from '@/pages/EditorPage';
import Community from '@/pages/workspace/Community';
import ViewDocument from '@/pages/workspace/ViewDocument';
import FindPeople from '@/pages/FindPeople';
import UserProfile from '@/pages/UserProfile';
import VerifyAccountPage from '@/pages/Auth/VerifyAccountPage';

export default function AppRoutes() {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/verify-account' element={<VerifyAccountPage />} />

            {/* Protected Routes (Implicitly protected for now, layout should enforce this) */}
            <Route path='/home' element={<Home />} />
            <Route path='/home/bookmark' element={<Bookmark />} />
            <Route path='/home/tagslist' element={<Tagslist />} />
            <Route path='/home/community' element={<Community />} />
            <Route path='/home/community/doc/:id' element={<ViewDocument />} />
            <Route path='/home/find-people' element={<FindPeople />} />
            <Route path='/home/profile/:id' element={<UserProfile />} />
            <Route path='/home/myworkspace' element={<Myworkspace />} />
            <Route path='/home/mytrash' element={<Mytrash />} />
            <Route path='/home/setting' element={<SettingsPage />} />
            <Route path='/home/editor' element={<EditorPage />} />
            <Route path='/share/:token' element={<EditorPage />} />
        </Routes>
    );
}
