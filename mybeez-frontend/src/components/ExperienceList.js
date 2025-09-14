import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExperienceCard from './ExperienceCard';
import FiltersModal from './FiltersModal';
import SearchBar from './SearchBar';

export default function ExperienceList() {
    const [searchParams] = useSearchParams();
    const [experiences, setExperiences] = useState(null); // null means loading initially
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: searchParams.get('categoryId') || '',
        sessionType: '',
        minDuration: '',
        maxDuration: '',
        minGroupPrice: '',
        maxGroupPrice: '',
    });

    const fetchExperiences = () => {
        const queryParams = new URLSearchParams();

        if (filters.keyword) {
            const trimmedKeyword = filters.keyword.trim().toLowerCase();
            if (trimmedKeyword) {
                queryParams.append('keyword', trimmedKeyword);
            }
        }
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.location) queryParams.append('location', filters.location.trim());
        if (filters.sessionType) queryParams.append('sessionType', filters.sessionType);
        if (filters.minDuration && !isNaN(filters.minDuration)) queryParams.append('minDuration', filters.minDuration);
        if (filters.maxDuration && !isNaN(filters.maxDuration)) queryParams.append('maxDuration', filters.maxDuration);
        if (filters.minGroupPrice && !isNaN(filters.minGroupPrice)) queryParams.append('minGroupPrice', filters.minGroupPrice);
        if (filters.maxGroupPrice && !isNaN(filters.maxGroupPrice)) queryParams.append('maxGroupPrice', filters.maxGroupPrice);

        setExperiences(null); // Set loading state before fetch
        fetch(`http://localhost:8080/api/experiences?${queryParams.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error('Filter API not available');
                return res.json();
            })
            .then(data => {
                setExperiences(data);
            })
            .catch(() => {
                setExperiences([]); // In case of error, show no results
            });
    };

    useEffect(() => {
        fetchExperiences();
    }, [filters]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Flex container for SearchBar and Filter button */}
            {/* Centered container for SearchBar and Filter button */}
            <div className="flex justify-center items-center flex-wrap gap-4 mb-8">
                <SearchBar
                    searchTerm={filters.keyword}
                    setSearchTerm={(keyword) => setFilters(prev => ({ ...prev, keyword }))}
                    handleSearch={fetchExperiences}
                />
                <FiltersModal
                    onApply={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                />
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Available Experiences
                </h2>
            </div>

            <div>
                {experiences === null ? (
                    <p className="text-center py-10 text-gray-600">Loading experiences... ⏳</p>
                ) : experiences.length === 0 ? (
                    <p className="text-center py-10 text-gray-600">No results found. 😔</p>
                ) : (
                    <div className="flex flex-wrap justify-center -mx-3">
                        {experiences.map(exp => (
                            <div key={exp.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-3">
                                <ExperienceCard experience={exp} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}