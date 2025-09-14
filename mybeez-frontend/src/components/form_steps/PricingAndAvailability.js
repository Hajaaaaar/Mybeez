import React, { useEffect, useState } from 'react';
import {
    CheckSquare, Square, Trash, PlusCircle, Pencil, FloppyDisk, CurrencyGbp
} from '@phosphor-icons/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, addDays } from 'date-fns';

// Sets the number of days from today that will be disabled for admin approval.
const ADMIN_APPROVAL_DAYS = 4;

const PricingAndAvailability = ({
                                    durationInHours,
                                    formData,
                                    handleChange,
                                    handleSessionTypeChange,
                                    addAvailabilitySlot,
                                    deleteAvailabilitySlot,
                                    handleUpdateSlot,
                                    onNext,
                                    onBack,
                                }) => {
    // New, unsaved slot state
    const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '12:00', capacity: '10' });
    const [selectedDates, setSelectedDates] = useState([]);
    const [slotError, setSlotError] = useState('');
    const [editingSlotIndex, setEditingSlotIndex] = useState(null);
    const [error, setError] = useState('');

    // Derived: PRIVATE only (PRIVATE selected, GROUP not selected)
    const onlyPrivate =
        formData.sessionTypes.includes('PRIVATE') && !formData.sessionTypes.includes('GROUP');

    // Lock the "new slot" capacity to 1 whenever only PRIVATE is selected
    useEffect(() => {
        if (onlyPrivate && newSlot.capacity !== '1') {
            setNewSlot((prev) => ({ ...prev, capacity: '1' }));
        }
    }, [onlyPrivate, newSlot.capacity]);

    // Normalize existing slots' capacity to 1 whenever only PRIVATE is selected
    useEffect(() => {
        if (!onlyPrivate) return;
        // Ensure each slot has capacity = '1'
        formData.availabilitySlots.forEach((slot, idx) => {
            if (String(slot.capacity) !== '1') {
                handleUpdateSlot(idx, 'capacity', '1');
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onlyPrivate]);

    // Dates window
    const today = new Date();
    const firstSelectableDate = addDays(today, ADMIN_APPROVAL_DAYS);
    const oneYearFromNow = addDays(today, 365);

    const calculateDurationInMinutes = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        if (end <= start) return -1;
        return (end.getTime() - start.getTime()) / 60000;
    };

    const handleNewSlotChange = (e) => {
        const { name, value } = e.target;
        // If capacity is edited while PRIVATE-only, keep it locked to 1
        if (onlyPrivate && name === 'capacity') return;
        setNewSlot((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSlots = () => {
        if (selectedDates.length === 0) {
            setSlotError('Please select at least one date from the calendar.');
            return;
        }
        if (!newSlot.startTime || !newSlot.endTime || (!newSlot.capacity && !onlyPrivate)) {
            setSlotError('Please set a time and capacity.');
            return;
        }

        const requiredDurationInHours = parseFloat(durationInHours);
        const requiredDurationInMinutes = requiredDurationInHours * 60;
        const slotDurationInMinutes = calculateDurationInMinutes(newSlot.startTime, newSlot.endTime);

        if (isNaN(requiredDurationInMinutes) || requiredDurationInMinutes <= 0) {
            setSlotError(
                'Please specify a valid experience duration before adding slots (you may need to go back a step).'
            );
            return;
        }

        if (slotDurationInMinutes !== requiredDurationInMinutes) {
            setSlotError(
                `Slot duration (${slotDurationInMinutes / 60} hour(s)) must match the experience duration of ${requiredDurationInHours} hour(s).`
            );
            return;
        }

        // Add each selected date as a slot; force capacity to 1 when PRIVATE-only
        setSlotError('');
        selectedDates.forEach((date) => {
            const formattedDate = format(date, 'yyyy-MM-dd');

            // Prevent duplicate (same date + time range)
            const isDuplicate = formData.availabilitySlots.some(
                (slot) =>
                    slot.date === formattedDate &&
                    slot.startTime === newSlot.startTime &&
                    slot.endTime === newSlot.endTime
            );
            if (isDuplicate) return;

            const slotToAdd = {
                ...newSlot,
                date: formattedDate,
                capacity: onlyPrivate ? '1' : newSlot.capacity,
            };
            addAvailabilitySlot(slotToAdd);
        });
        setSelectedDates([]);
    };

    const handleContinue = () => {
        setError('');
        let isValid = true;
        let errorMessage = '';

        if (formData.sessionTypes.length === 0) {
            errorMessage = 'Please select at least one session type.';
            isValid = false;
        }

        if (formData.availabilitySlots.length === 0) {
            errorMessage = 'Please add at least one availability slot.';
            isValid = false;
        }

        if (formData.sessionTypes.includes('GROUP')) {
            if (!formData.groupPricePerPerson || parseFloat(formData.groupPricePerPerson) < 1) {
                errorMessage = 'Group price must be at least £1.';
                isValid = false;
            }
        }

        if (formData.sessionTypes.includes('PRIVATE')) {
            if (!formData.privatePrice || parseFloat(formData.privatePrice) < 1) {
                errorMessage = 'Private price must be at least £1.';
                isValid = false;
            }
        }

        if (isValid) onNext();
        else setError(errorMessage);
    };

    return (
        <div className="animate-fade-in max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900">Pricing & Availability</h2>
            <p className="text-md text-gray-600 mt-2">Define your session types, pricing, and schedule.</p>

            {/* Session Types */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700">Session Types</h3>
                <div className="mt-4 space-y-3">
                    <label className="flex items-center cursor-pointer p-3 border-2 border-transparent rounded-lg hover:bg-gray-50">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.sessionTypes.includes('GROUP')}
                            onChange={() => handleSessionTypeChange('GROUP')}
                        />
                        {formData.sessionTypes.includes('GROUP') ? (
                            <CheckSquare size={24} weight="fill" className="text-blue-600" />
                        ) : (
                            <Square size={24} className="text-gray-400" />
                        )}
                        <span className="ml-3 text-gray-700">Group Session (Price for each person)</span>
                    </label>

                    <label className="flex items-center cursor-pointer p-3 border-2 border-transparent rounded-lg hover:bg-gray-50">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.sessionTypes.includes('PRIVATE')}
                            onChange={() => handleSessionTypeChange('PRIVATE')}
                        />
                        {formData.sessionTypes.includes('PRIVATE') ? (
                            <CheckSquare size={24} weight="fill" className="text-blue-600" />
                        ) : (
                            <Square size={24} className="text-gray-400" />
                        )}
                        <span className="ml-3 text-gray-700">Private Session (Price for the session)</span>
                    </label>
                </div>
            </div>

            {/* Group Price */}
            {formData.sessionTypes.includes('GROUP') && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div>
                        <label htmlFor="groupPricePerPerson" className="text-lg font-semibold text-gray-700">
                            Group Price/Person (£)
                        </label>
                        <div className="relative mt-2">
                            <CurrencyGbp
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="number"
                                id="groupPricePerPerson"
                                name="groupPricePerPerson"
                                value={formData.groupPricePerPerson}
                                onChange={handleChange}
                                className="w-full p-3 pl-10 border rounded-lg"
                                min="1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Private Price */}
            {formData.sessionTypes.includes('PRIVATE') && (
                <div className="mt-6 animate-fade-in">
                    <label htmlFor="privatePrice" className="text-lg font-semibold text-gray-700">
                        Private Session Price (£)
                    </label>
                    <div className="relative mt-2">
                        <CurrencyGbp
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="number"
                            id="privatePrice"
                            name="privatePrice"
                            value={formData.privatePrice}
                            onChange={handleChange}
                            className="w-full p-3 pl-10 border rounded-lg"
                            min="1"
                        />
                    </div>
                </div>
            )}

            {/* Calendar + New Slot */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700">Set Your Availability</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Select dates on the calendar. Dates within the next {ADMIN_APPROVAL_DAYS} days are disabled
                    to allow for admin review.
                </p>

                <div className="mt-4 p-4 border rounded-xl flex justify-center">
                    <DayPicker
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        fromDate={firstSelectableDate}
                        toDate={oneYearFromNow}
                        disabled={{ before: firstSelectableDate }}
                        defaultMonth={firstSelectableDate}
                    />
                </div>

                <div className="p-4 mt-2 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-xs font-medium">Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            value={newSlot.startTime}
                            onChange={handleNewSlotChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium">End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            value={newSlot.endTime}
                            onChange={handleNewSlotChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium">Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={onlyPrivate ? '1' : newSlot.capacity}
                            onChange={handleNewSlotChange}
                            className={`w-full p-2 border rounded-md ${onlyPrivate ? 'bg-gray-100 text-gray-600' : ''}`}
                            disabled={onlyPrivate}
                            min="1"
                        />

                    </div>
                </div>

                {slotError && <p className="text-red-500 text-sm mt-2">{slotError}</p>}

                <button
                    onClick={handleAddSlots}
                    className="w-full mt-4 bg-blue-100 text-blue-800 font-semibold py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} /> Add Slots for Selected Dates
                </button>
            </div>

            {/* Added Slots */}
            {formData.availabilitySlots.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-semibold mb-2">Added Slots</h4>
                    <div className="space-y-2">
                        {formData.availabilitySlots.map((slot, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm"
                            >
                                {editingSlotIndex === index ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="date"
                                            value={slot.date}
                                            onChange={(e) => handleUpdateSlot(index, 'date', e.target.value)}
                                            className="w-full p-1 border rounded-md text-sm"
                                        />
                                        <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => handleUpdateSlot(index, 'startTime', e.target.value)}
                                            className="w-full p-1 border rounded-md text-sm"
                                        />
                                        <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => handleUpdateSlot(index, 'endTime', e.target.value)}
                                            className="w-full p-1 border rounded-md text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={onlyPrivate ? '1' : slot.capacity}
                                            onChange={(e) => handleUpdateSlot(index, 'capacity', e.target.value)}
                                            className={`w-20 p-1 border rounded-md text-sm ${
                                                onlyPrivate ? 'bg-gray-100 text-gray-600' : ''
                                            }`}
                                            disabled={onlyPrivate}
                                            min="1"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-800">
                    <span className="font-semibold">
                      {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                      })}
                    </span>
                                        <span className="text-gray-500 mx-2">|</span>
                                        {slot.startTime} - {slot.endTime}
                                        <span className="text-gray-500 mx-2">|</span>
                                        Capacity:{' '}
                                        {onlyPrivate ? (
                                            <>
                                                1 <span className="text-xs text-gray-500">(fixed)</span>
                                            </>
                                        ) : (
                                            slot.capacity
                                        )}
                                    </p>
                                )}

                                <div className="flex items-center gap-1 ml-4">
                                    {editingSlotIndex === index ? (
                                        <button
                                            onClick={() => setEditingSlotIndex(null)}
                                            className="text-green-500 hover:text-green-700 p-1"
                                        >
                                            <FloppyDisk size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setEditingSlotIndex(index)}
                                            className="text-blue-500 hover:text-blue-700 p-1"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteAvailabilitySlot(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 font-semibold mt-6 text-center">{error}</p>}

            <div className="mt-12 flex justify-between">
                <button
                    onClick={onBack}
                    className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-300"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-sm hover:bg-blue-700"
                >
                    Save and Continue
                </button>
            </div>
        </div>
    );
};

export default PricingAndAvailability;
