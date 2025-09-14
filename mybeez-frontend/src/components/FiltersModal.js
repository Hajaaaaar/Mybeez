import React, { useState } from 'react';

export default function FiltersModal({ onApply }) {
    const [show, setShow] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: '',
        location: '',
        sessionType: '',
        minDuration: '',
        maxDuration: '',
        minGroupPrice: '',
        maxGroupPrice: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            categoryId: '',
            location: '',
            sessionType: '',
            minDuration: '',
            maxDuration: '',
            minGroupPrice: '',
            maxGroupPrice: '',
        });
    };

    const applyFilters = async () => {
        const params = new URLSearchParams();

        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.sessionType) params.append('sessionType', filters.sessionType);
        if (filters.location) params.append('location', filters.location);
        if (filters.minDuration && !isNaN(filters.minDuration)) params.append('minDuration', filters.minDuration);
        if (filters.maxDuration && !isNaN(filters.maxDuration)) params.append('maxDuration', filters.maxDuration);
        if (filters.minGroupPrice && !isNaN(filters.minGroupPrice)) params.append('minGroupPrice', filters.minGroupPrice);
        if (filters.maxGroupPrice && !isNaN(filters.maxGroupPrice)) params.append('maxGroupPrice', filters.maxGroupPrice);

        console.log('Applying filters:', Object.fromEntries(params.entries()));

        try {
            const response = await fetch(`/api/experiences/filter-experiences?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch filtered experiences');
            onApply(filters);
            setShow(false);
        } catch (error) {
            console.error('Error fetching filtered experiences:', error);
        }
    };

    return (
        <>
            <button
                onClick={() => setShow(true)}
                className="border rounded-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 24 24"
                     strokeWidth={1.5} stroke="currentColor"
                     className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h13M3 12h9m-9 6h5" />
                </svg>
                Filters
            </button>

            {show && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-[90%] max-w-lg md:max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4 text-center">Filters</h2>

                        <div className="space-y-6 pr-2">
                            <div>
                                <h3 className="text-md font-semibold mb-3">Explore by Category</h3>
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { id: '1', emoji: '🍲', label: 'Food & Drink' },
                                        { id: '2', emoji: '🎨', label: 'Arts & Culture' },
                                        { id: '3', emoji: '🌲', label: 'Nature & Outdoors' },
                                        { id: '4', emoji: '🧘‍♀️', label: 'Fitness & Wellness' },
                                        { id: '5', emoji: '🎭', label: 'Entertainment' },
                                        { id: '6', emoji: '🛠️', label: 'Workshops & Skills' },
                                    ].map(({ id, emoji, label }) => (
                                        <button
                                            key={id}
                                            onClick={() => setFilters(prev => ({ ...prev, categoryId: id }))}
                                            className={`flex flex-col items-center justify-center border rounded-xl px-4 py-3 bg-white hover:bg-gray-50 shadow-sm transition ${filters.categoryId === id ? 'ring-2 ring-blue-500' : ''}`}
                                        >
                                            <span className="text-2xl opacity-50">{emoji}</span>
                                            <span className="text-xs mt-1 text-gray-700">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Keyword</label>
                                <input
                                    name="keyword"
                                    placeholder="Search by keyword..."
                                    value={filters.keyword}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    name="location"
                                    placeholder="Enter location..."
                                    value={filters.location}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Session Type</label>
                                <div className="flex gap-3">
                                    {['', 'Group', 'Individual'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFilters(prev => ({ ...prev, sessionType: type }))}
                                            className={`px-4 py-2 rounded-full border ${filters.sessionType === type ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
                                        >
                                            {type || 'Any type'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Min Duration (mins)</label>
                                    <input
                                        type="number"
                                        name="minDuration"
                                        value={filters.minDuration}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Max Duration (mins)</label>
                                    <input
                                        type="number"
                                        name="maxDuration"
                                        value={filters.maxDuration}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Min Price</label>
                                    <input
                                        type="number"
                                        name="minGroupPrice"
                                        value={filters.minGroupPrice}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Max Price</label>
                                    <input
                                        type="number"
                                        name="maxGroupPrice"
                                        value={filters.maxGroupPrice}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={clearFilters}
                                className="text-gray-600 hover:underline"
                            >
                                Clear all
                            </button>
                            <button
                                onClick={applyFilters}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                Apply Filters
                            </button>
                        </div>

                        <button
                            onClick={() => setShow(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
