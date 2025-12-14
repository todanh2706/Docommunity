import React from 'react';
import { SortAsc, Search, X, Grid, List } from 'lucide-react';
import { TagDropMenu, SortDropMenu } from './DropMenu';

const FilterToolbar = ({
    // State
    searchValue,
    setSearchValue,
    sortConfig,
    filterTags,
    isSortOpen,
    setIsSortOpen,
    isTagMenuOpen,
    setIsTagMenuOpen,
    availableTags,
    viewMode, // 'grid' or 'list'
    setViewMode, // function to toggle or set view mode

    // Handlers
    onSortSelection,
    onSortClear,
    onTagSelection,

    // Config
    showViewToggle = true, // Defaults to true

    // Slots/Children
    children // For extra buttons (Add, More, etc.)
}) => {

    const handleCloseSort = () => {
        setIsSortOpen(false);
    };

    const toggleSort = () => {
        setIsSortOpen(!isSortOpen);
    };

    return (
        <div className="w-full p-3 mb-6 bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">

                {/* LEFT AREA */}
                <div className="flex flex-wrap items-center gap-3 flex-1">

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={toggleSort} className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-700 transition flex-shrink-0">
                            <SortAsc size={20} className="mr-2" />
                            <span className="hidden md:block font-medium">Sort</span>
                        </button>
                        <SortDropMenu
                            isOpen={isSortOpen}
                            onClose={handleCloseSort}
                            sortConfig={sortConfig}
                            onSelect={onSortSelection}
                            onClear={onSortClear}
                        />
                    </div>

                    {/* Tags */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                            className={`flex items-center px-2 py-1 rounded-lg transition flex-shrink-0 
                                ${isTagMenuOpen || filterTags.length > 0 ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'}
                            `}
                        >
                            <span className="hidden md:block font-medium">Tags</span>
                        </button>

                        {isTagMenuOpen && (
                            <TagDropMenu
                                isOpen={isTagMenuOpen}
                                onClose={() => setIsTagMenuOpen(false)}
                                selectedTags={filterTags}
                                onToggleTag={onTagSelection}
                                availableTags={availableTags}
                            />
                        )}
                    </div>

                    {/* SEARCH BAR */}
                    <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 w-full md:w-auto md:max-w-sm">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Value"
                            className="bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none w-full"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {searchValue && (
                            <button onClick={() => setSearchValue("")} className="p-1 rounded-full hover:bg-gray-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT AREA */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {showViewToggle && setViewMode && (
                        <button
                            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                            className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0"
                        >
                            {viewMode === 'grid' ? <Grid size={20} /> : <List size={20} />}
                        </button>
                    )}

                    {/* Extra Actions (Add Button, etc.) */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterToolbar;
