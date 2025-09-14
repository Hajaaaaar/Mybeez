import React, { useEffect, useState } from 'react';
import ExperienceService from '../services/experience.service';

import PendingExperiences from "../components/host_experiences/PendingExperiences";
import ApprovedExperiences from "../components/host_experiences/ApprovedExperiences";
import CompletedExperiences from "../components/host_experiences/CompletedExperiences";

const HostExperiencesPage = ({ status }) => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        ExperienceService.getHostExperiencesByStatus(status)
            .then(response => {
                setExperiences(response.data);
                console.log(response.data)
            })
            .catch(err => {
                console.error(`Failed to fetch ${status} experiences:`, err);
                setError('Could not load experiences. Please try again later.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [status]);

    const renderContent = () => {
        if (loading) return <div className="text-center p-8">Loading...</div>;
        if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
        if (experiences.length === 0) {
            return <p className="text-center p-8 bg-gray-50 rounded-lg">You have no {status.toLowerCase()} experiences.</p>;
        }

        // Conditionally render the correct component based on the status prop
        switch (status) {
            case 'PENDING':
                return <PendingExperiences experiences={experiences} />;
            case 'APPROVED':
                return <ApprovedExperiences experiences={experiences} />;
            case 'COMPLETED':
                return <CompletedExperiences experiences={experiences} />;
            default:
                return <p>Unknown status.</p>;
        }
    };

    const pageTitle = {
        PENDING: 'Experiences Awaiting Approval',
        APPROVED: 'Approved & Ongoing Experiences',
        COMPLETED: 'Completed Experiences'
    }[status];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{pageTitle}</h1>
            {renderContent()}
        </div>
    );
};

export default HostExperiencesPage;