import React from 'react';
import moment from 'moment';
import { Calendar as CalendarIcon, User, Trash, Clock, Info } from '@phosphor-icons/react';
import CalendarModal from "./CalendarModal";


const EventDetailsModal = ({
                               isOpen,
                               onClose,
                               event,
                               onDelete
                           }) => {
    if (!event) return null;

    return (
        <CalendarModal
            isOpen={isOpen}
            onClose={onClose}
            title="Event Details"
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                        event.type === 'experience' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                        {event.type === 'experience' ? (
                            <CalendarIcon size={20} className="text-green-600" />
                        ) : (
                            <User size={20} className="text-blue-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">{event.type} Event</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span>{moment(event.start).format('MMM D, YYYY')}</span>
                        </div>
                        <div className="flex items-center text-sm ml-6">
                            <span>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span>
                        </div>
                    </div>

                    {event.description && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2 border-t">
                    {event.type === 'personal' ? (
                        <>
                            <button
                                onClick={onDelete}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center"
                            >
                                <Trash size={16} className="mr-2" />
                                Delete
                            </button>
                            {/*<button*/}
                            {/*    onClick={onClose}*/}
                            {/*    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"*/}
                            {/*>*/}
                            {/*    Close*/}
                            {/*</button>*/}
                        </>
                    ) : (
                        <>
                            <div className="flex-1 bg-gray-100 p-3 rounded-md">
                                <p className="text-sm text-gray-600 flex items-start">
                                    <Info size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                                    Experience slots are managed from the Experience page
                                </p>
                            </div>
                            {/*<button*/}
                            {/*    onClick={onClose}*/}
                            {/*    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"*/}
                            {/*>*/}
                            {/*    Close*/}
                            {/*</button>*/}
                        </>
                    )}
                </div>
            </div>
        </CalendarModal>
    );
};

export default EventDetailsModal;