import React, { useState, useEffect } from 'react';
import AdminService from '../services/admin.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
    House, Users, ChartBar, Star, CheckCircle, ClipboardText
} from '@phosphor-icons/react';
import ExperienceDetailModal from "../components/admin_dashboard/ExperienceDetailModal";
import RejectionModal from "../components/admin_dashboard/RejectionModal"; // <-- import

const ExperienceApprovalsPage = () => {
    // --- Sidebar Setup ---
    const navigate = useNavigate();
    const menuItems = [
        { label: 'Dashboard', icon: House, route: '/admin-dashboard' },
        { label: 'Users', icon: Users, route: '/admin/users' },
        { label: 'User Stats', icon: ChartBar, route: '/admin/stats' },
        { label: 'User Approvals', icon: CheckCircle, route: '/admin/users-actions' },
        { label: 'Experience Approvals', icon: ClipboardText, route: '/admin/experience-approvals' }
    ];

    // --- Page State & Logic ---
    const [pending, setPending] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedExperienceId, setSelectedExperienceId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Rejection modal state
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null); // { id, title }
    const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = () => {
        setIsLoading(true);
        AdminService.getPendingExperiences()
            .then(response => setPending(response.data))
            .catch(() => toast.error("Could not fetch pending experiences."))
            .finally(() => setIsLoading(false));
    };

    // Detail modal control
    const handleOpenModal = (id) => {
        setSelectedExperienceId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExperienceId(null);
    };

    // Approve from detail modal
    const handleApprove = (id) => {
        AdminService.approveExperience(id)
            .then(() => {
                toast.success("Experience approved successfully!");
                fetchPending();
                handleCloseModal();
            })
            .catch(() => toast.error("Failed to approve experience."));
    };

    // Open RejectionModal from detail modal
    const handleOpenRejectModal = (experience) => {
        setRejectTarget({ id: experience.id, title: experience.title });
        setIsRejectOpen(true);
    };

    const closeRejectModal = () => {
        setIsRejectOpen(false);
        setRejectTarget(null);
        setIsRejectSubmitting(false);
    };

    // Submit rejection reason to API
    const submitRejection = (finalReason) => {
        if (!rejectTarget?.id) return;
        setIsRejectSubmitting(true);

        AdminService.rejectExperience(rejectTarget.id, finalReason)
            .then(() => {
                toast.success("Experience rejected.");
                fetchPending();
                closeRejectModal();
                handleCloseModal(); // also close details
            })
            .catch(() => toast.error("Failed to reject experience."))
            .finally(() => setIsRejectSubmitting(false));
    };

    return (
        <div className="flex h-screen bg-white">
            <aside className="group relative bg-white shadow-md transition-all duration-300 hover:w-52 w-16 flex flex-col justify-between py-4">
                <div className="flex flex-col items-center group-hover:items-start gap-4 px-2">
                    {menuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(item.route)}
                                className="flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors"
                            >
                                {IconComponent && <IconComponent size={24} />}
                                <span className="hidden group-hover:inline text-sm whitespace-nowrap">{item.label}</span>
                            </button>
                        );
                    })}
                    <div className="w-full group/reviews">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            <Star size={24} />
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">Reviews</span>
                        </button>
                        <div className="hidden group-hover/reviews:block">
                            <div className="pl-10 mt-1 space-y-1">
                                <button onClick={() => navigate('/admin/reviews')} className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"> - All</button>
                                <button onClick={() => navigate('/admin/reviews/pending')} className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"> - Pending</button>
                                <button onClick={() => navigate('/admin/reviews/approved')} className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"> - Approved</button>
                                <button onClick={() => navigate('/admin/reviews/rejected')} className="block w-full text-left text-sm text-gray-700 hover:text-blue-600"> - Rejected</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-grow p-8 bg-white overflow-auto">
                <h1 className="text-2xl font-semibold mb-6">Experience Approvals</h1>

                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Host Name</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                                <span className="sr-only">View Details</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {pending.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-gray-500">No pending experiences found.</td>
                            </tr>
                        ) : (
                            pending.map(exp => (
                                <tr
                                    key={exp.id}
                                    onClick={() => handleOpenModal(exp.id)}
                                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <td className="py-4 px-4 font-medium text-gray-800">{exp.title}</td>
                                    <td className="py-4 px-4">{exp.host?.firstName} {exp.host?.lastName}</td>
                                    <td className="py-4 px-4 text-right">
                      <span className="text-blue-600 font-semibold hover:underline">
                        Click to view
                      </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </main>

            {/* Detail modal (approve / reject) */}
            <ExperienceDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                experienceId={selectedExperienceId}
                onApprove={handleApprove}
                onReject={handleOpenRejectModal} // <-- open RejectionModal instead of prompt
            />

            {/* Rejection reason modal */}
            <RejectionModal
                isOpen={isRejectOpen}
                onClose={closeRejectModal}
                onSubmit={submitRejection}
                experienceTitle={rejectTarget?.title || ''}
            />

            {/* Optional overlay/loader if you want to block while submitting */}
            {isRejectSubmitting && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center">
                    <div className="bg-white rounded-lg px-6 py-4 shadow">Submitting rejection…</div>
                </div>
            )}
        </div>
    );
};

export default ExperienceApprovalsPage;
