import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    House, Users, Star, CheckCircle, ChartBar,
    Eye, Envelope, IdentificationCard, Calendar, Check, X
} from '@phosphor-icons/react';
import api from '../services/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', icon: <House size={24} />, route: '/admin-dashboard' },
        { label: 'Users', icon: <Users size={24} />, route: '/admin/users' },
        { label: 'User Stats', icon: <ChartBar size={24} />, route: '/admin/stats' },
        { label: 'Approvals', icon: <CheckCircle size={24} />, route: '/admin/users-actions' }
    ];

    useEffect(() => {
        fetchUsers(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchUsers = async (pageNumber) => {
        setLoading(true);
        try {
            const { data } = await api.get('/check', { params: { page: pageNumber, size } });
            setUsers(data?.content ?? []);
            setTotalPages(data?.totalPages ?? 1);
        } catch (error) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                navigate('/login', { replace: true });
                return;
            }
            console.error('Failed to fetch users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (id) => navigate(`/profile/${id}`);
    const fmt = (v) => (v ? new Date(v).toLocaleString() : '-');

    return (
        <div className="flex h-screen bg-white">
            {/* HostDashboardSidebar (matches the completed AdminDashboard) */}
            <aside className="group relative bg-white shadow-md transition-all duration-300 ease-in-out hover:w-48 w-16 flex flex-col justify-between py-4">
                <div className="flex flex-col items-center group-hover:items-start gap-4 px-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.route)}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            {item.icon}
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}

                    {/* Reviews with hover-only submenu (closes immediately on mouse leave) */}
                    <div className="w-full group/reviews">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            <Star size={24} />
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">Reviews</span>
                        </button>

                        {/* Subheadings: one per line, prefixed with hyphen, show only on hover */}
                        <div className="hidden group-hover/reviews:block">
                            <div className="pl-10 mt-1 space-y-1">
                                <button
                                    onClick={() => navigate('/admin/reviews')}
                                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
                                >
                                    - All Reviews
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reviews/pending')}
                                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
                                >
                                    - Pending Reviews
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reviews/approved')}
                                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
                                >
                                    - Approved Reviews
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reviews/rejected')}
                                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
                                >
                                    - Rejected Reviews
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-grow p-6 overflow-auto">
                <h2 className="text-2xl font-semibold mb-6">User Management</h2>

                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100 text-left text-gray-700">
                                    <th className="py-2 px-4 border-b">
                                        <IdentificationCard size={16} className="inline mr-1" />
                                        ID
                                    </th>
                                    <th className="py-2 px-4 border-b">First Name</th>
                                    <th className="py-2 px-4 border-b">Last Name</th>
                                    <th className="py-2 px-4 border-b">
                                        <Envelope size={16} className="inline mr-1" />
                                        Email
                                    </th>
                                    <th className="py-2 px-4 border-b">Role</th>
                                    <th className="py-2 px-4 border-b">Active</th>
                                    <th className="py-2 px-4 border-b">
                                        <Calendar size={16} className="inline mr-1" />
                                        Created
                                    </th>
                                    <th className="py-2 px-4 border-b">Updated</th>
                                    <th className="py-2 px-4 border-b">Registered</th>
                                    <th className="py-2 px-4 border-b">Summary</th>
                                    <th className="py-2 px-4 border-b">View</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-4">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{user.id}</td>
                                            <td className="py-2 px-4 border-b">{user.firstName}</td>
                                            <td className="py-2 px-4 border-b">{user.lastName}</td>
                                            <td className="py-2 px-4 border-b">{user.email}</td>
                                            <td className="py-2 px-4 border-b">{user.role}</td>
                                            <td className="py-2 px-4 border-b">
                                                {user.active ? <Check size={16} /> : <X size={16} />}
                                            </td>
                                            <td className="py-2 px-4 border-b">{fmt(user.createdAt)}</td>
                                            <td className="py-2 px-4 border-b">{fmt(user.updatedAt)}</td>
                                            <td className="py-2 px-4 border-b">{fmt(user.registrationDate)}</td>
                                            <td className="py-2 px-4 border-b break-words">{user.summary || '-'}</td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    onClick={() => handleViewProfile(user.id)}
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm">Page {page + 1} of {totalPages}</span>
                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
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
