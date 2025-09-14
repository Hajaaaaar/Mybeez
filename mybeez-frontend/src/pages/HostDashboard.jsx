import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetabaseService from '../services/metabase.service';
import HostDashboardService from '../services/host.dashboard.service';
import BookingManagementService from '../services/booking.management.service';
import PendingRequestsModal from '../components/PendingRequestsModal';

const HostDashboard = () => {
    const [stats, setStats] = useState(null);
    const [dashboardUrl, setDashboardUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = () => {
        // We don't set loading to true here to avoid the whole page flashing on refresh
        Promise.all([
            HostDashboardService.getDashboardData(),
            MetabaseService.getHostDashboardUrl()
        ]).then(([statsResponse, urlResponse]) => {
            setStats(statsResponse.data);
            setDashboardUrl(urlResponse.data.url);
        }).catch(error => {
            console.error("Failed to load dashboard data", error);
            setError("Could not load dashboard data. Please try again later.");
        }).finally(() => {
            setLoading(false);
        });
    };

    const openRequestsModal = () => {
        setModalLoading(true);
        setIsModalOpen(true);
        BookingManagementService.getPendingBookings()
            .then(response => {
                setPendingBookings(response.data);
            })
            .catch(err => console.error("Failed to fetch pending bookings:", err))
            .finally(() => setModalLoading(false));
    };

    const handleApprove = (bookingId) => {
        BookingManagementService.approveBooking(bookingId)
            .then(() => {
                setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
                fetchDashboardData(); // Refresh main dashboard stats
            })
            .catch(err => console.error("Failed to approve booking:", err));
    };

    const handleReject = (bookingId) => {
        BookingManagementService.rejectBooking(bookingId)
            .then(() => {
                setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
                fetchDashboardData(); // Refresh main dashboard stats
            })
            .catch(err => console.error("Failed to reject booking:", err));
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div>
            {/* Welcome message and create experience button */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
                    <p className="text-gray-500 mt-1">Here's a snapshot of your hosting activity.</p>
                </div>
                <Link to="/host/create-experience">
                    <button className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <span>Create New Experience</span>
                    </button>
                </Link>
            </div>

            {/* Conditional banner for pending requests */}
            {stats && stats.pendingRequests > 0 && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg mb-8 flex justify-between items-center shadow-sm">
                    <p className="font-semibold">You have {stats.pendingRequests} new booking requests that need your approval.</p>
                    <button onClick={openRequestsModal} className="text-sm font-bold text-blue-600 hover:underline">View Requests</button>
                </div>
            )}

            {stats && (
                <>
                    {/* Stat Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-sm font-medium text-gray-500">Upcoming Bookings</h2><p className="text-3xl font-bold text-gray-800 mt-2">{stats.upcomingBookings}</p></div>
                        <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-sm font-medium text-gray-500">Overall Rating</h2><p className="text-3xl font-bold text-gray-800 mt-2 flex items-center">{stats.overallRating} <svg className="w-5 h-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></p></div>
                        <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-sm font-medium text-gray-500">Total Earnings (This Month)</h2><p className="text-3xl font-bold text-gray-800 mt-2">£{stats.totalEarningsMonth.toLocaleString()}</p></div>
                        <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-sm font-medium text-gray-500">Most Popular Experience</h2><p className="text-xl font-bold text-indigo-600 mt-2 truncate">{stats.mostPopularExperience}</p></div>
                    </div>

                    {/* Metabase Dashboard Section */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Analytics</h2>
                        <iframe src={dashboardUrl} frameBorder="0" className="w-full h-[400px] lg:h-[600px]"
                                allowTransparency="true"></iframe>
                    </div>

                    {/* Recent Reviews Section */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reviews</h2>
                        <div className="space-y-4">
                            {stats.recentReviews.map((review) => (
                                <div key={review.id} className="p-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center mb-1"><p className="font-semibold">{review.reviewerName}</p><p className="text-xs text-gray-400 ml-2">on "{review.experienceTitle}"</p></div>
                                    <p className="text-sm text-gray-600 italic">"{review.reviewText}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* The modal component for pending requests */}
            <PendingRequestsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bookings={pendingBookings}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={modalLoading}
            />
        </div>
    );
};

export default HostDashboard;
