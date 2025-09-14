import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    House, Users, Star, CheckCircle, ChartBar
} from '@phosphor-icons/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4F46E5', '#10B981', '#EF4444', '#9CA3AF']; // Indigo, Green, Red, Gray

export default function UserStatsChartPage() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: stats } = await api.get('/check/stats');
                setData([
                    { name: 'Active Users', value: stats.activeUsers },
                    { name: 'Total Users',  value: stats.totalUsers },
                    { name: 'Banned Users', value: stats.bannedUsers },
                    { name: 'Deleted Users', value: stats.deletedUsers }
                ]);
            } catch (err) {
                const status = err.response?.status;
                if (status === 401 || status === 403) {
                    navigate('/login', { replace: true });
                    return;
                }
                console.error('Error fetching stats:', err);
                setData([]);
            }
        };
        load();
    }, [navigate]);

    const menuItems = [
        { label: 'Dashboard', icon: <House size={24} />, route: '/admin-dashboard' },
        { label: 'Users', icon: <Users size={24} />, route: '/admin/users' },
        { label: 'User Stats', icon: <ChartBar size={24} />, route: '/admin/stats' },
        { label: 'Approvals', icon: <CheckCircle size={24} />, route: '/admin/users-actions' }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* HostDashboardSidebar */}
            <aside className="group relative bg-white shadow-md hover:w-48 w-16 flex flex-col justify-between py-4 transition-all duration-300 ease-in-out">
                <div className="flex flex-col items-center group-hover:items-start gap-4 px-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.route)}
                            className="flex items-center w-full gap-2 text-gray-800 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            {item.icon}
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}

                    {/* Reviews with hover-only submenu (closes on mouse leave) */}
                    <div className="w-full group/reviews">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex items-center w-full gap-2 text-gray-800 hover:text-black hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            <Star size={24} />
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">Reviews</span>
                        </button>

                        {/* Subheadings: one per line, prefixed with hyphen */}
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

            {/* Main Content */}
            <main className="flex-grow p-8 overflow-auto">
                <h1 className="text-2xl font-semibold mb-6">User Statistics</h1>

                <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">User Distribution</h2>

                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value">
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-sm">Loading statistics...</p>
                    )}
                </div>
            </main>
        </div>
    );
}
