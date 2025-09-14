import React from 'react';
import moment from 'moment';

const CalendarToolbar = ({ date, view, onNavigate, onView }) => {
    const label = moment(date).format('MMMM YYYY');

    return (
        <div className="flex justify-between items-center mb-4 px-1">
            {/* Left side: Navigation and Title */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {label}
                </h2>
            </div>

            {/* Right side: View Toggles */}
            <div className="flex items-center border border-gray-300 rounded-md">
                <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-l-md focus:outline-none focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                        view === 'month'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => onView('month')}
                >
                    Month
                </button>
                <button
                    className={`px-4 py-1.5 text-sm font-medium border-l border-r border-gray-300 focus:outline-none focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                        view === 'week'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => onView('week')}
                >
                    Week
                </button>
                <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-r-md focus:outline-none focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                        view === 'day'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => onView('day')}
                >
                    Day
                </button>
            </div>
        </div>
    );
};

export default CalendarToolbar;