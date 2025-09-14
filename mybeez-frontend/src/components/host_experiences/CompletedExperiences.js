import React from 'react';
import { Link } from 'react-router-dom';

const CompletedExperiences = ({ experiences }) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {experiences.map(exp => (
                <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{exp.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">$5,000</td> {/* Placeholder */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{exp.rating?.toFixed(1) || 'No Rating'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/experience/${exp.id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default CompletedExperiences;