import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    House, Users, Star, CheckCircle, ChartBar, Calendar
} from '@phosphor-icons/react';
import api from '../services/api';

export default function ApprovedReviews() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const fetchApprovedReviews = async (pageNumber) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/reviews/approved', {
                params: { page: pageNumber, size }
            });
            setReviews(Array.isArray(data?.content) ? data.content : []);
            setTotalPages(Number.isInteger(data?.totalPages) ? data.totalPages : 1);
        } catch (error) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                navigate('/login', { replace: true });
                return;
            }
            console.error('Failed to fetch approved reviews:', error);
            setReviews([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovedReviews(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <div className="flex h-screen bg-white">
            <aside className="group relative bg-white shadow-md transition-all duration-300 hover:w-48 w-16 flex flex-col justify-between py-4">
                <div className="flex flex-col items-center group-hover:items-start gap-4 px-2">
                    <button onClick={() => navigate('/admin-dashboard')} className={`flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors text-sm ${isActive('/admin-dashboard') ? 'bg-gray-100 font-semibold' : ''}`}>
                        <House size={24} />
                        <span className="hidden group-hover:inline">Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/admin/users')} className={`flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors text-sm ${isActive('/admin/users') ? 'bg-gray-100 font-semibold' : ''}`}>
                        <Users size={24} />
                        <span className="hidden group-hover:inline">Users</span>
                    </button>
                    <button onClick={() => navigate('/admin/stats')} className={`flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors text-sm ${isActive('/admin/stats') ? 'bg-gray-100 font-semibold' : ''}`}>
                        <ChartBar size={24} />
                        <span className="hidden group-hover:inline">User Stats</span>
                    </button>
                    <button onClick={() => navigate('/admin/users-actions')} className={`flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors text-sm ${isActive('/admin/users-actions') ? 'bg-gray-100 font-semibold' : ''}`}>
                        <CheckCircle size={24} />
                        <span className="hidden group-hover:inline">Approvals</span>
                    </button>

                    <div className="w-full group/reviews">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors text-sm"
                        >
                            <Star size={24} />
                            <span className="hidden group-hover:inline flex-grow">Reviews</span>
                        </button>

                        <div className="hidden group-hover/reviews:block">
                            <div className="pl-10 mt-1 space-y-1">
                                <button onClick={() => navigate('/admin/reviews')} className={`block text-sm text-left whitespace-nowrap ${isActive('/admin/reviews') ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}>- All Reviews</button>
                                <button onClick={() => navigate('/admin/reviews/pending')} className={`block text-sm text-left whitespace-nowrap ${isActive('/admin/reviews/pending') ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}>- Pending Reviews</button>
                                <button onClick={() => navigate('/admin/reviews/approved')} className={`block text-sm text-left whitespace-nowrap ${isActive('/admin/reviews/approved') ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}>- Approved Reviews</button>
                                <button onClick={() => navigate('/admin/reviews/rejected')} className={`block text-sm text-left whitespace-nowrap ${isActive('/admin/reviews/rejected') ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'}`}>- Rejected Reviews</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-grow p-6 overflow-auto">
                <h2 className="text-2xl font-semibold mb-6">Approved Reviews</h2>

                {loading ? (
                    <p>Loading approved reviews...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100 text-left text-gray-700">
                                    <th className="py-2 px-4 border-b">Review ID</th>
                                    <th className="py-2 px-4 border-b">Reviewer</th>
                                    <th className="py-2 px-4 border-b">Experience ID</th>
                                    <th className="py-2 px-4 border-b">Rating</th>
                                    <th className="py-2 px-4 border-b">Comment</th>
                                    <th className="py-2 px-4 border-b">
                                        <Calendar size={16} className="inline mr-1" /> Date
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {reviews.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-4">No approved reviews found.</td></tr>
                                ) : (
                                    reviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{review.id}</td>
                                            <td className="py-2 px-4 border-b">{review.reviewerName}</td>
                                            <td className="py-2 px-4 border-b">{review.experienceId}</td>
                                            <td className="py-2 px-4 border-b">{review.rating} ★</td>
                                            <td className="py-2 px-4 border-b break-words">{review.reviewText}</td>
                                            <td className="py-2 px-4 border-b">{review.createdAt ? new Date(review.createdAt).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm">Page {page + 1} of {totalPages}</span>
                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
