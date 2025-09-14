import React from 'react';

const PendingRequestsModal = ({ isOpen, onClose, bookings, onApprove, onReject, loading }) => {
    // If the modal is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-800">Pending Booking Requests</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="mt-4">
                    {loading ? (
                        <div className="text-center text-gray-500">Loading requests...</div>
                    ) : (
                        <>
                            {bookings && bookings.length > 0 ? (
                                <ul className="space-y-4">
                                    {bookings.map(booking => (
                                        <li key={booking.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-700">Booking #{booking.id}</p>
                                                    {/* The backend now sends a flat DTO, so access properties directly */}
                                                    <p className="text-sm text-gray-500 mt-1">Experience: {booking.experienceTitle}</p>
                                                    <p className="text-sm text-gray-500">Date: {booking.bookingDate}</p>
                                                    <p className="text-sm text-gray-500">Time: {booking.startTime} - {booking.endTime}</p>
                                                    <p className="text-sm text-gray-500">Guests: {booking.numberOfGuests}</p>
                                                    <p className="text-sm text-gray-500">Total Price: £{booking.totalPrice}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => onApprove(booking.id)}
                                                        className="bg-green-500 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-green-600 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(booking.id)}
                                                        className="bg-red-500 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-gray-500 p-4">
                                    You have no pending booking requests at this time.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingRequestsModal;
