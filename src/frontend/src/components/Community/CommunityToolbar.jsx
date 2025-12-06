import React from 'react';
import { SortAsc, Search, X } from 'lucide-react';

const CommunityToolbar = ({ value, setValue }) => {
    return (
        <div className="w-full p-3 mb-6 bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* LEFT AREA */}
                <div className="flex items-center gap-3 flex-1">
                    {/* Sort */}
                    <button className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                        <SortAsc size={20} className="mr-2" />
                        <span className="hidden md:block font-medium">Sort</span>
                    </button>

                    {/* Tags */}
                    <button className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                        <span className="hidden md:block font-medium">Tags</span>
                    </button>

                    {/* SEARCH BAR */}
                    <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 w-full md:w-64">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Value"
                            className="bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none w-full"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        {value && (
                            <button onClick={() => setValue("")} className="p-1 rounded-full hover:bg-gray-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityToolbar;
