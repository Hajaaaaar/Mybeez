import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';

// "Minimum 5 photos" reason removed from this array.
const commonReasons = [
    "Inappropriate title or description",
    "Photos are low quality (blurry, copyrighted, etc.)",
    "Pricing or session information is unclear",
    "Potential safety concerns with the itinerary or location"
];

const RejectionModal = ({ isOpen, onClose, onSubmit, experienceTitle }) => {
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [otherReason, setOtherReason] = useState('');
    const [error, setError] = useState('');

    // Reset state when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedReasons([]);
            setOtherReason('');
            setError('');
        }
    }, [isOpen]);

    const handleReasonToggle = (reason) => {
        setSelectedReasons(prev =>
            prev.includes(reason)
                ? prev.filter(r => r !== reason)
                : [...prev, reason]
        );
    };

    const handleSubmit = () => {
        if (selectedReasons.length === 0 && !otherReason.trim()) {
            setError('Please select at least one reason or provide a custom one.');
            return;
        }

        const finalReason = [
            ...selectedReasons,
            otherReason.trim()
        ].filter(Boolean).join('. ');

        onSubmit(finalReason);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold">Reason for Rejection</h3>
                        <p className="text-sm text-gray-500 truncate">Experience: {experienceTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="font-semibold text-gray-700">Select any common reasons:</p>
                    <div className="space-y-2">
                        {commonReasons.map(reason => (
                            <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedReasons.includes(reason)}
                                    onChange={() => handleReasonToggle(reason)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-800">{reason}</span>
                            </label>
                        ))}
                    </div>

                    {/* "Other" checkbox removed; textarea is now always visible. */}
                    <div>
                        <label className="font-semibold text-gray-700">Custom Reason (if applicable):</label>
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            rows="3"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Provide a specific reason if the options above don't apply..."
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
                        Submit Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;