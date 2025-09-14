import React from 'react';
import { Outlet } from 'react-router-dom';
import HostDashboardSidebar from './HostDashboardSidebar';


const HostLayout = ({ unreadCount, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <HostDashboardSidebar unreadCount={unreadCount} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default HostLayout;