import React, { useState } from 'react';
import moment from 'moment';
import { Calendar } from '@phosphor-icons/react';
import CalendarModal from "./CalendarModal";

const AddEntryModal = ({
                           isOpen,
                           onClose,
                           formData,
                           setFormData,
                           onSubmit
                       }) => {
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            setError('Please enter a title for your entry.');
            return;
        }
        setError('');
        onSubmit(formData);
    };

    // UPDATED: A more robust function to handle time changes
    const handleTimeChange = (field, value) => {
        // Always use the original start date as the base
        const baseDate = new Date(formData.start);

        const [hours, minutes] = value.split(':');

        // Create a new date object for the field being changed
        const newDate = new Date(formData[field]);

        // Set the date parts to match the baseDate to keep it on the same day
        newDate.setFullYear(baseDate.getFullYear());
        newDate.setMonth(baseDate.getMonth());
        newDate.setDate(baseDate.getDate());

        // Set the new time from the input
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));

        setFormData(prev => ({ ...prev, [field]: newDate }));
    };


    if (!formData.start) {
        return null;
    }

    return (
        <CalendarModal isOpen={isOpen} onClose={onClose} title="Add Personal Entry">
            <div className="space-y-4">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="Enter event title"
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                {/* Non-editable date display */}
                <div className="text-sm text-gray-600 pt-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <span>{moment(formData.start).format('dddd, MMMM D, YYYY')}</span>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={moment(formData.start).format('HH:mm')}
                            onChange={(e) => handleTimeChange('start', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="time"
                            value={moment(formData.end).format('HH:mm')}
                            onChange={(e) => handleTimeChange('end', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="3"
                        placeholder="Enter event description (optional)"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Create Entry
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </CalendarModal>
    );
};

export default AddEntryModal;