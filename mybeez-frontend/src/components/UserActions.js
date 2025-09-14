import React, { useEffect, useState } from 'react';
import {
    Trash, Eye, X, Check, DotsThreeVertical,
    House, Users, ChartBar, Star, CheckCircle
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserActions() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', icon: <House size={24} />, route: '/admin-dashboard' },
        { label: 'Users', icon: <Users size={24} />, route: '/admin/users' },
        { label: 'User Stats', icon: <ChartBar size={24} />, route: '/admin/stats' },
        { label: 'Approvals', icon: <CheckCircle size={24} />, route: '/admin/users-actions' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/check', { params: { page: 0, size: 100 } });
            setUsers((data?.content ?? []).filter(u => !u.deleted));
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                navigate('/login', { replace: true });
                return;
            }
            console.error('Failed to fetch users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUnban = async (id, isActive) => {
        const action = isActive ? 'ban' : 'unban';
        try {
            await api.post(`/check/${id}/${action}`);
            setOpenDropdownId(null);
            fetchUsers();
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) return navigate('/login', { replace: true });
            console.error(`Failed to ${action} user ${id}:`, err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/check/${id}`);
            setOpenDropdownId(null);
            fetchUsers();
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) return navigate('/login', { replace: true });
            console.error(`Failed to delete user ${id}:`, err);
        }
    };

    const handleViewProfile = (id) => {
        setOpenDropdownId(null);
        navigate(`/profile/${id}`);
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    return (
        <div className="flex h-screen bg-white">
            {/* HostDashboardSidebar (matches the completed pattern with Reviews hover submenu) */}
            <aside className="group relative bg-white shadow-md transition-all duration-300 hover:w-48 w-16 flex flex-col justify-between py-4">
                <div className="flex flex-col items-center group-hover:items-start gap-4 px-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.route)}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            {item.icon}
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}

                    {/* Reviews with hover-only submenu (one line each, hyphen prefix) */}
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
            <main className="flex-grow p-8 bg-white shadow-md rounded overflow-auto">
                <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <table className="min-w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border">ID</th>
                            <th className="py-2 px-4 border">Name</th>
                            <th className="py-2 px-4 border">Email</th>
                            <th className="py-2 px-4 border">Role</th>
                            <th className="py-2 px-4 border">Active</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 relative">
                                <td className="py-2 px-4 border">{user.id}</td>
                                <td className="py-2 px-4 border">{user.firstName} {user.lastName}</td>
                                <td className="py-2 px-4 border">{user.email}</td>
                                <td className="py-2 px-4 border">{user.role}</td>
                                <td className="py-2 px-4 border">{user.active ? 'Active' : 'Inactive'}</td>
                                <td className="py-2 px-4 border text-center relative">
                                    <button onClick={() => toggleDropdown(user.id)} className="hover:bg-gray-200 p-1 rounded">
                                        <DotsThreeVertical size={20} className="opacity-60" />
                                    </button>

                                    {openDropdownId === user.id && (
                                        <div className="absolute right-4 mt-2 bg-white border border-gray-300 shadow-md rounded w-44 z-10">
                                            <button
                                                onClick={() => handleViewProfile(user.id)}
                                                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                                            >
                                                <Eye size={16} className="mr-2 opacity-60" />
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleBanUnban(user.id, user.active)}
                                                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                                            >
                                                {user.active ? (
                                                    <>
                                                        <X size={16} className="mr-2 opacity-60" />
                                                        Ban
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} className="mr-2 opacity-60" />
                                                        Unban
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                                            >
                                                <Trash size={16} className="mr-2 opacity-60" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No users found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
}
