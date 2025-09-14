import React from 'react';

export default function SearchBar({ searchTerm, setSearchTerm, handleSearch }) {
    return (
        // mx-auto centers the bar, and max-w-lg makes it smaller
        <div className="w-full max-w-lg">
            <div className="flex items-center w-full bg-white rounded-full border border-gray-200 shadow-md hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300 p-2">

                {/* Icon and Input Field */}
                <div className="flex items-center flex-grow pl-3">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search experiences..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        className="w-full ml-3 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                    />
                </div>

                {/* Divider and Search Button */}
                <div className="flex items-center">
                    <div className="border-l border-gray-200 h-6 mx-2"></div>
                    <button
                        onClick={handleSearch}
                        className="w-10 h-10 bg-blue-600 rounded-full text-white flex-shrink-0 flex items-center justify-center hover:bg-blue-700 transition-colors"
                        aria-label="Search"
                    >
                        <svg
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}