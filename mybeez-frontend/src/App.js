import React, { useState, useEffect, useCallback } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import axios from 'axios';


import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// --- Import Guest & Auth Components ---
import HomePage from './components/Homepage';
import ExperienceDetail from './components/ExperienceDetail';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ExperienceList from "./components/ExperienceList";
import PaymentCart from "./components/PaymentCart";
import WishlistPage from "./components/WishlistPage";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import UserProfilePage from './components/UserProfilePage';
import VerifyIdentityPage from './components/VerifyIdentityPage';
import BookingConfirmationPage from './components/BookingConfirmationPage';

// --- Import Host Components ---
import HostDashboard from './pages/HostDashboard';
import CreateExperiencePage from './pages/CreateExperiencePage';
import HostLayout from './components/HostLayout';
import CalendarPage from './pages/CalendarPage';
import InboxPage from './components/InboxPage';
import HostExperiencesPage from './pages/HostExperiencesPage';
import BecomeHostPage from './components/BecomeHostPage';
import HostApplicationForm from './components/HostApplicationForm';


// --- Import Admin Components ---
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import UserActions from "./components/UserActions";
import UserStatsChartPage from "./components/UserStatsChart";
import ReviewsManagement from "./components/ReviewsManagement";
import ApproveReviews from "./components/ApproveReviews";
import RejectedReviews from "./components/RejectedReviews";
import PendingReviews from "./components/PendingReviews";



// --- Import Other Components ---
import AboutPage from './pages/AboutPage';
import ProtectedRoute from "./components/ProtectedRoute";
import AuthService from './services/auth.service';
import ExperienceApprovalsPage from "./pages/ExperienceApprovalsPage";

// --- Admin Protected Routes ---
const AdminRoute = ({ children }) => {
    const location = useLocation();
    const user = AuthService.getCurrentUser();

    // Not logged in → go to login and remember target
    if (!user?.accessToken) {
        sessionStorage.setItem('loginRedirectUrl', location.pathname);
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin
    if (user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const pathsWithoutFooter = ['/messages', '/host/inbox'];
    const shouldShowFooter = !pathsWithoutFooter.includes(location.pathname);

    const isHostPage = location.pathname.startsWith('/host');

    // Function to fetch the unread count
    const fetchUnreadCount = useCallback(() => {
        //Use the user object directly from AuthService to ensure it's always the most current
        const user = AuthService.getCurrentUser();
        if (user) {
            const headers = { 'Authorization': `Bearer ${user.accessToken}` };
            axios.get('/api/messages/unread-count', { headers })
                .then(response => {
                    setUnreadCount(response.data.unreadCount);
                })
                .catch(error => {
                    // It's common for this to fail if the token expires, so I silence the console error
                    // console.error("Failed to fetch unread message count:", error);
                });
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount(); // Fetch immediately on load

        // Set up a timer to poll for new messages every 15 seconds
        const intervalId = setInterval(fetchUnreadCount, 15000);

        // Clean up the timer when the component unmounts
        return () => clearInterval(intervalId);
    }, [fetchUnreadCount]);
    const handleAuthChange = () => {
        setCurrentUser(AuthService.getCurrentUser());
        // After login/signup immediately fetch the count
        fetchUnreadCount();
    };
    const logOut = (e) => {
        e.preventDefault();
        AuthService.logout();
        setCurrentUser(undefined);
        setUnreadCount(0);
        navigate("/login");
    };

    return (
        <div className="flex flex-col min-h-screen">
            {!isHostPage && <Header currentUser={currentUser} onLogout={logOut} unreadCount={unreadCount}/>}

            <main className="flex-grow">
                <Routes>
                    {/* --- Guest, Public, and Auth Routes --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/experience" element={<ExperienceList />} />
                    <Route path="/experience/:id" element={<ExperienceDetail onAuthChange={handleAuthChange} />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/about" element={<AboutPage />} />

                    <Route
                        path="/login"
                        element={
                            currentUser
                                ? <Navigate to={
                                    currentUser.role === 'ADMIN'
                                        ? '/admin-dashboard'
                                        : currentUser.role === 'HOST'
                                            ? '/host/dashboard'
                                            : '/profile'
                                } />
                                : <Login onLoginSuccess={handleAuthChange} />
                        }
                    />
                    <Route path="/signup" element={currentUser ? <Navigate to="/profile" /> : <SignUp onSignupSuccess={handleAuthChange} />} />
                    <Route path="/confirm-booking" element={<BookingConfirmationPage onAuthChange={handleAuthChange} />} />

                    {/* Pass the fetchUnreadCount function to the InboxPage */}
                    <Route path="/messages" element={<InboxPage onConversationAction={fetchUnreadCount} />} />

                    {/* --- Temporarily Unprotected Routes --- */}
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/cart" element={<PaymentCart />} />
                    <Route path="/verify-identity" element={<VerifyIdentityPage />} />
                    {/* --- Admin Routes (Protected) --- */}
                    <Route
                        path="/admin-dashboard"
                        element={<AdminRoute><Dashboard /></AdminRoute>}
                    />
                    <Route
                        path="/admin/users"
                        element={<AdminRoute><UserManagement /></AdminRoute>}
                    />
                    <Route
                        path="/admin/users-actions"
                        element={<AdminRoute><UserActions /></AdminRoute>}
                    />
                    <Route
                        path="/admin/stats"
                        element={<AdminRoute><UserStatsChartPage /></AdminRoute>}
                    />
                    <Route
                        path="/admin/reviews"
                        element={<AdminRoute><ReviewsManagement /></AdminRoute>}
                    />
                    <Route
                        path="/admin/reviews/pending"
                        element={<AdminRoute><PendingReviews /></AdminRoute>}
                    />
                    <Route
                        path="/admin/reviews/approved"
                        element={<AdminRoute><ApproveReviews /></AdminRoute>}
                    />
                    <Route
                        path="/admin/reviews/rejected"
                        element={<AdminRoute><RejectedReviews /></AdminRoute>}
                    />
                    <Route path="/admin/experience-approvals"
                           element={<AdminRoute><ExperienceApprovalsPage /> </AdminRoute>} />





                    {/* --- "Become a Host" routes are now top-level --- */}
                    <Route path="/become-a-host" element={<BecomeHostPage />} />
                    <Route path="/become-a-host/apply" element={<HostApplicationForm />} />

                    {/* --- Host Routes --- */}
                    <Route path="/host" element={<ProtectedRoute requiredRole="HOST" />}>
                        <Route element={<HostLayout unreadCount={unreadCount} onLogout={logOut} />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<HostDashboard />} />
                            <Route path="create-experience" element={<CreateExperiencePage />} />
                            <Route path="edit-experience/:id" element={<CreateExperiencePage />} />
                            <Route path="calendar" element={<CalendarPage />} />
                            <Route path="inbox" element={<InboxPage onConversationAction={fetchUnreadCount} />} />
                            <Route path="experiences/pending" element={<HostExperiencesPage status="PENDING" />} />
                            <Route path="experiences/approved" element={<HostExperiencesPage status="APPROVED" />} />
                            <Route path="experiences/completed" element={<HostExperiencesPage status="COMPLETED" />} />
                        </Route>
                    </Route>
                    {/* Catch-all route to redirect unknown paths */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            {shouldShowFooter && <Footer />}
        </div>
    );
}

// App needs to be wrapped in Router to use hooks like useNavigate
const AppWrapper = () => (
    <Router>
        <ScrollToTop />
        <App />
    </Router>
);

export default AppWrapper;
