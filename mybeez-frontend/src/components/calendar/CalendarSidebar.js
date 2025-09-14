import React from 'react';

const CalendarSidebar = ({
                     showExperienceEvents,
                     setShowExperienceEvents,
                     showPersonalEvents,
                     setShowPersonalEvents
                 }) => {
    return (
        // Changed md:w-56 to md:w-52
        <aside className="w-full md:w-52 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">View</h3>
                <div className="space-y-3">
                    <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                checked={showExperienceEvents}
                                onChange={(e) => setShowExperienceEvents(e.target.checked)}
                            />
                            <span className="text-sm text-gray-700">Experience Events</span>
                        </label>
                    </div>
                    <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={showPersonalEvents}
                                onChange={(e) => setShowPersonalEvents(e.target.checked)}
                            />
                            <span className="text-sm text-gray-700">Personal Events</span>
                        </label>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CalendarSidebar;