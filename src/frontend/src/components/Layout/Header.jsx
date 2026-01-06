import { Link } from 'react-router'
import { User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { useUser } from '../../hooks/useUser.js';

export function Header() {
  const { logout } = useAuth();
  const { getUserProfile } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userAvatar, setUserAvatar] = useState("/dump_avt.jpg");

  const handleSignOut = () => {
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUserAvatar(data.avatar_url || "/dump_avt.jpg");
      } catch (error) {
        console.error("Failed to fetch user for header", error);
      }
    };
    if (localStorage.getItem('accessToken')) {
      fetchUser();
    }
  }, []);

  return (
    <header>
      <div className="flex justify-between p-4  bg-white/3 shadow-lg z-12 ">

        {/* Logo bên trái */}

        <Link to="/home" className="contents">
          <img src='logo.png' alt="Logo" className="h-20 w-auto" />
        </Link>

        {/* Nút ở góc phải */}
        <div className="flex gap-3 items-center relative" ref={dropdownRef}>
          {localStorage.getItem('accessToken') ? (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-full bg-white/10 hover:bg-white/20 transition border-2 border-white/20 shadow-lg overflow-hidden"
              >
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-12 h-12 object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#062452]/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="py-1">
                    <Link
                      to="/home/setting"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      Manage Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className='contents'>
                <button className="px-6 py-2 font-semibold rounded hover:bg-gray-700 transition text-xl">
                  Sign In
                </button>
              </Link>
              <Link to="/register" className='contents'>
                <button className="px-6 py-2 font-semibold rounded
               bg-gradient-to-r from-[#062452] to-[#325C9E]
               hover:opacity-90 transition text-xl ">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

      </div>

    </header>

  );
}