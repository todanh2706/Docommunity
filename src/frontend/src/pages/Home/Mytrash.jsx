import { Sidebar } from "../../components/Layout/Sidebar";
import { useState } from 'react';

import {
    Edit, SortAsc, Tag, Search, X, Grid, List, Plus, Upload, MoreVertical, Trash
} from 'lucide-react';

const mockCards = [
    { title: 'project 02', date: '23/01/1782', tags: [], members: 2, note: 'Nội dung tóm tắt...' },
    { title: 'MML - note', date: '21/01/1782', tags: [], members: 0, note: '' },
    { title: 'project 01', date: '23/01/1782', tags: ['security', 'mailflood'], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'Writeup CTF', date: '23/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'Writeup CTF', date: '21/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
    { title: 'MML - note', date: '21/01/1782', tags: [], members: 0, note: '' },
    { title: 'project 02', date: '21/01/1782', tags: ['security', 'mailflood'], members: 3, note: 'Nội dung tóm tắt...' },
    { title: 'project 01', date: '20/01/1782', tags: [], members: 0, note: 'Nội dung tóm tắt...' },
];


const DocumentCard = ({ card, isExpanded }) => {
    const isBlank = !card.note && card.members === 0 && card.tags.length === 0;

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition duration-200">
            <div className={`p-4 ${isExpanded ? 'h-48' : 'h-10'} flex flex-col justify-between ${isBlank && isExpanded ? 'bg-gray-700' : ''}`}>

                {isBlank && isExpanded ? (
                    <div className="flex-grow flex items-center justify-center text-gray-500 ">
                        <Edit size={32} />
                    </div>
                ) : (
                    <>
                        {isExpanded ? (<img src='logo.png' className="w-32 h-auto" />) : null}

                        <div className={`flex justify-between items-center ${isExpanded ? 'mt-4' : ''}`}>
                            <div className="flex -space-x-2 overflow-hidden">
                                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                                    <span role="img" aria-label="user">🙂</span>
                                </div>
                                {card.members > 0 && (
                                    <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                                        +{card.members}
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-1">
                                {card.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-blue-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Card */}
            <div className={`p-3 ${isExpanded ? "border-t border-gray-700" : ""} `}>
                <p className="text-lg font-semibold truncate">{card.title}</p>
                <p className="text-xs text-gray-400">{card.date}</p>
            </div>
        </div>
    );
};



export default function Mytrash() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [value, setValue] = useState("");

    const toggleList = () => {
        setIsExpanded(!isExpanded)
        console.log(isExpanded)
    };

    return (
        <>
            <div className="flex flex-row items-left justify-between h-screen">
                <Sidebar />

                <div className="flex-grow p-6 overflow-y-auto bg-gray-900 text-gray-100">
                    <div className="flex text-3xl font-bold space-x-2 mb-5">
                        <Trash size={35}></Trash>
                        <h1>TRASH</h1>
                    </div>
                    {/* Search and Action Bar */}

                    <div className="flex flex-col md:flex-row items-center justify-between p-2 mb-6 bg-gray-800 rounded-lg shadow-lg">

                        {/* Left Actions: Sort & Tags */}
                        <div className="flex items-center space-x-1 md:space-x-4">
                            <button className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition">
                                <SortAsc size={20} className="mr-2" />
                                <span className="hidden md:block font-medium">Sort</span>
                            </button>
                            <button className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition">
                                <Tag size={20} className="mr-2" />
                                <span className="hidden md:block font-medium">Tags</span>
                            </button>

                            {/* Search Input (Mockup of the image's search bar) */}
                            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1">
                                <Search size={14} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none w-8 md:w-35 "
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                <button onClick={() => setValue("")} className="p-1 rounded-full hover:bg-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions: View Toggles & Other */}
                        <div className="flex items-center space-x-4">
                            <button onClick={toggleList} className="p-2 rounded-lg bg-blue-600 text-white">
                                {isExpanded ? (<Grid size={20} />) : <List size={20} />}
                                {/* Active Grid View */}
                            </button>

                            <button className="p-2 rounded-lg hover:bg-gray-700">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {mockCards.map((card, index) => (
                            <DocumentCard key={index} card={card} isExpanded={isExpanded} />
                        ))}
                    </div>
                </div>
            </div>


        </>
    );
}