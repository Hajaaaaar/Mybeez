import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    House, Users, Star, CheckCircle, ChartBar, ClipboardText
} from '@phosphor-icons/react';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', icon: House, route: '/admin-dashboard' },
        { label: 'Users', icon: Users, route: '/admin/users' },
        { label: 'User Stats', icon: ChartBar, route: '/admin/stats' },
        { label: 'User Approvals', icon: CheckCircle, route: '/admin/users-actions' },
        { label: 'Experience Approvals', icon: ClipboardText, route: '/admin/experience-approvals' },
        // { label: 'Approved Experiences', icon: ClipboardText, route: '/admin/experience-approved' }
    ];


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
                    {/* Reviews with hover-only submenu (closes when cursor leaves) */}
                    <div className="w-full group/reviews">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex items-center w-full gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                            <Star size={24} />
                            <span className="hidden group-hover:inline text-sm whitespace-nowrap">Reviews</span>
                        </button>

                        {/* Subheadings (show only while hovering Reviews block) */}
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
            <main className="flex-grow p-8">
                <h1 className="text-2xl font-semibold">AdminDashboard</h1>
                <p className="mt-4 text-gray-600">This is your central admin view. Use the sidebar to navigate.</p>
            </main>
        </div>
    );
}
