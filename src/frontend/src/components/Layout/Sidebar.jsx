import React, { useState } from 'react';
import { Link } from 'react-router';

import {
  ChevronsLeft, Bookmark, Tag, Users, Trash2, Plus, Folder,
  LayoutGrid, Grid, Edit, X, Search,
} from 'lucide-react'; // Sử dụng thư viện icon Lucide React

// --- Dữ liệu cho Menu Item ---
const navGroups = [
  // Nhóm 1: Thẻ cá nhân
  [
    { name: 'Bookmark', icon: Bookmark, href: '#' },
    { name: 'Tag list', icon: Tag, href: '#' },
  ],
  // Nhóm 2: Thẻ cộng đồng/đội nhóm
  [
    { name: 'My workspace', icon: LayoutGrid, href: '#' },
    { name: 'Community', icon: Users, href: '#' },
  ],
  // Nhóm 3: Thẻ thùng rác
  [
    { name: 'My trash', icon: Trash2, href: '#' },
  ],
];

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`h-screen flex flex-col bg-gray-900 text-gray-200 transition-all duration-300 ${isExpanded ? 'w-50 p-4' : 'w-20 p-4 items-center'
        }`}
    >
      {/* Header Logo và Toggle Button */}

      <div className={`flex flex-col ${isExpanded ? 'justify-between' : 'justify-center'} items-center mb-6`}>
        <Link to="/" className="contents">
          {isExpanded ? (

            <img src='/logo.png' className="h-[60%] w-auto " />
          ) : (<img src='/logo_small.png' className="h-[60%] w-auto " />)}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-800 transition duration-150"
          aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <ChevronsLeft size={24} className={isExpanded ? 'transform rotate-0' : 'transform rotate-180'} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 space-y-3">
        <button className={`w-full flex items-center p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150 justify-center`}>
          <Plus size={20} className="mr-2" />
          {isExpanded && 'Add note'}
        </button>
        <button className={`w-full flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-800 transition duration-150 justify-center`}>
          <Folder size={20} className="mr-2" />
          {isExpanded && 'Create folder'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow space-y-2">
        {navGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {/* Vòng lặp 2: Lặp qua các mục (item) trong nhóm */}
            {group.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition duration-150 ${!isExpanded && 'justify-center'}`}
                title={!isExpanded ? item.name : ''}
              >
                <item.icon size={20} className={`${isExpanded ? 'mr-3' : 'mr-0'}`} />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </a>
            ))}

            {/* CHÈN ĐƯỜNG KẺ NGANG (Separator) */}
            {/* Chỉ hiển thị đường kẻ ngang nếu đây KHÔNG phải là nhóm cuối cùng */}
            {groupIndex < navGroups.length - 1 && (
              <div className="my-4 border-t border-gray-700 mx-[-16px]"></div>
            )}
          </React.Fragment>
        ))}
      </nav>
      {/* Footer Profile */}
      <Link to="/home/setting" className='contents' >
        <div className={`mt-auto pt-4 border-t border-gray-700 flex ${isExpanded ? 'flex-row' : 'flex-col items-center'} `}>
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            HK
          </div>
          {isExpanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium whitespace-nowrap">Title</p>
              <p className="text-xs text-gray-400 truncate">Description</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;