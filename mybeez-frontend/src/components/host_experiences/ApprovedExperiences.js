import React from 'react';
import { Link } from 'react-router-dom';

const ApprovedExperiences = ({ experiences }) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {experiences.map(exp => (
                <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exp.title}</div>
                        {/* FIX: Display the city from the nested location object */}
                        <div className="text-sm text-gray-500">{exp.location?.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exp.upcomingBookings || 0} {/* Placeholder data */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exp.rating?.toFixed(1) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col items-end space-y-2">
                            <Link to={`/host/edit-experience/${exp.id}`} className="text-indigo-600 hover:text-indigo-900">Edit Listing</Link>
                            <Link to={`/host/experience/${exp.id}/calendar`} className="text-indigo-600 hover:text-indigo-900">Manage Calendar</Link>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default ApprovedExperiences;