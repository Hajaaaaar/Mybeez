// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// // Layouts and Route Guards
// import MainLayout from './components/MainLayout';
// import HostLayout from './components/HostLayout';
// import ProtectedRoute from './components/ProtectedRoute';

// // Page Components
// import ExperienceList from './components/ExperienceList';
// import ExperienceDetail from './components/ExperienceDetail';
// import Login from './components/Login';
// import SignUp from './components/SignUp';
// import WishlistPage from './components/WishlistPage';
// import ProfilePage from './pages/ProfilePage';
// import HostDashboard from './pages/HostDashboard';
// import CreateExperiencePage from './pages/CreateExperiencePage';
// import HostExperiencesPage from './pages/HostExperiencesPage';

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* --- Public Routes with Main Layout --- */}
//       <Route path="/" element={<MainLayout />}>
//         <Route index element={<h1 className="text-center p-8 text-3xl font-bold">Welcome to MyBeez</h1>} />
//         <Route path="experiences" element={<ExperienceList />} />
//         <Route path="experience/:id" element={<ExperienceDetail />} />
//         <Route path="login" element={<Login />} />
//         <Route path="signup" element={<SignUp />} />

//         {/* --- Protected Routes for All Logged-in Users --- */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="profile" element={<ProfilePage />} />
//           <Route path="wishlist" element={<WishlistPage />} />
//         </Route>

//         {/* --- Protected Routes for HOST Users Only --- */}
//         <Route path="host" element={<ProtectedRoute requiredRole="HOST" />}>
//             <Route element={<HostLayout />}>
//                 <Route index element={<Navigate to="dashboard" replace />} />
//                 <Route path="dashboard" element={<HostDashboard />} />
//                 <Route path="create-experience" element={<CreateExperiencePage />} />
//                 <Route path="experiences/pending" element={<HostExperiencesPage status="PENDING" />} />
//                 <Route path="experiences/approved" element={<HostExperiencesPage status="APPROVED" />} />
//                 <Route path="experiences/completed" element={<HostExperiencesPage status="COMPLETED" />} />
//             </Route>
//         </Route>
        
//         {/* Catch-all for unknown paths */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Route>
//     </Routes>
//   );
// };

// export default AppRoutes;