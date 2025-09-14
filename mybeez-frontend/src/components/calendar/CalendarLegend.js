import React from 'react';
import { Lightbulb, CalendarBlank, Info } from '@phosphor-icons/react';

const CalendarLegend = () => {
    return (
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Experience Availability Slots</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-700">Personal Schedule</span>
            </div>
            <div className="text-gray-500 flex items-center gap-1">
                <Lightbulb size={16} className="text-gray-400" />
                <span>Click empty time to add personal events</span>
            </div>
            <div className="text-gray-500 flex items-center gap-1">
                <CalendarBlank size={16} className="text-gray-400" />
                <span>Click events to view details or manage</span>
            </div>
            <div className="text-gray-500 flex items-center gap-1">
                <Info size={16} className="text-gray-400" />
                <span>Experience slots are managed from the Experience page</span>
            </div>
        </div>
    );
};

export default CalendarLegend;