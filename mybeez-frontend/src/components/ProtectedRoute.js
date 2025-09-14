import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/auth.service';

const ProtectedRoute = ({ requiredRole }) => {
    const currentUser = AuthService.getCurrentUser();

    console.log('ProtectedRoute - Current User:', currentUser);
    console.log('ProtectedRoute - Required Role:', requiredRole);
    console.log('ProtectedRoute - User Role:', currentUser?.role);

    if (!currentUser) {
        console.log('ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
        console.log('ProtectedRoute - Role mismatch, redirecting to home');
        return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute - Access granted, rendering Outlet');
    return <Outlet />;
};

export default ProtectedRoute;