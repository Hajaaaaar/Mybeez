import React from 'react';
import CalendarModal from "./CalendarModal";

const DeleteConfirmModal = ({
                                isOpen,
                                onClose,
                                eventTitle,
                                onConfirm
                            }) => {
    return (
        <CalendarModal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Event"
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-gray-600">
                    Are you sure you want to delete "{eventTitle}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </CalendarModal>
    );
};

export default DeleteConfirmModal;