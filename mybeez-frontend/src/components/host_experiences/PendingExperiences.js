import React from 'react';
import { Link } from 'react-router-dom';

const PendingExperiences = ({ experiences }) => (

    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {experiences.map(exp => (
                <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{exp.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{exp.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Under Review
                            </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* FIX: Added the "Edit" link as required by the user story */}
                        <div className="flex flex-col items-end space-y-2">
                            <Link to={`/host/edit-experience/${exp.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                            <Link to={`/experience/${exp.id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default PendingExperiences;