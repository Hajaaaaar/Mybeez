import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- SVG ICONS ---
const MenuIcon = ({ className = 'w-6 h-6' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const CloseIcon = ({ className = 'w-6 h-6' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const CartIcon = ({ className = 'w-7 h-7' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.117 1.243H4.252c-.654 0-1.187-.585-1.117-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.117 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const WishlistIcon = ({ className = 'w-7 h-7' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const ProfileIcon = ({ className = 'w-7 h-7' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MessageIcon = ({ className = 'w-7 h-7' }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const Header = ({ currentUser, onLogout, unreadCount }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isAdmin =
        !!currentUser &&
        (
            currentUser.role === 'ROLE_ADMIN' ||
            currentUser.role === 'ADMIN' ||
            (Array.isArray(currentUser.roles) && (currentUser.roles.includes('ROLE_ADMIN') || currentUser.roles.includes('ADMIN'))) ||
            (Array.isArray(currentUser.authorities) && currentUser.authorities.some(a =>
                a === 'ROLE_ADMIN' || a === 'ADMIN' || a?.authority === 'ROLE_ADMIN' || a?.authority === 'ADMIN'
            ))
        );

    const navLinkClasses = ({ isActive }) =>
        `font-semibold text-slate-700 hover:text-indigo-600 transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-indigo-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 ${isActive ? 'text-indigo-600 after:scale-x-100' : 'hover:after:scale-x-100'}`;

    const mobileNavLinkClasses = ({ isActive }) =>
        `text-lg font-semibold py-3 w-full text-center ${isActive ? 'bg-indigo-50 text-indigo-700 rounded-lg' : 'text-slate-700'}`;

    const closeAllMenus = () => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    };

    const renderHostLink = (isMobile = false) => {
        if (currentUser && currentUser.role === 'HOST') {
            console.log(currentUser)
            return <NavLink to="/host" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeAllMenus}>Host Dashboard</NavLink>;
        } else {
            return <NavLink to="/become-a-host" className={isMobile ? mobileNavLinkClasses : navLinkClasses} onClick={closeAllMenus}>Become a Host</NavLink>;
        }
    };
    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" onClick={closeAllMenus}>
                    <img src="/images/Mybeez.png" alt="MyBeez Logo" className="h-8 w-auto" />
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <NavLink to="/experience" className={navLinkClasses}>Explore</NavLink>
                    {renderHostLink()}
                    {currentUser && <NavLink to="/my-experiences" className={navLinkClasses}>My Experiences</NavLink>}
                    <NavLink to="/about" className={navLinkClasses}>About</NavLink>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    {currentUser ? (
                        <>
                            <NavLink to="/wishlist" className="text-slate-700 group flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-110">
                                <WishlistIcon className="w-7 h-7 group-hover:fill-red-500 group-hover:stroke-red-500 transition-colors duration-300" />
                            </NavLink>
                            <NavLink to="/messages" className="text-slate-700 group flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-110 relative">
                                <MessageIcon className="w-7 h-7 group-hover:text-indigo-600 transition-colors duration-300" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </NavLink>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <NavLink to="/cart" className="text-slate-700 hover:text-blue-600 transition-colors duration-300 flex items-center justify-center">
                                    <CartIcon />
                                </NavLink>
                            </motion.div>
                            <div className="relative" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                                <motion.button className="text-slate-700 hover:text-indigo-600 transition-colors duration-300 flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                                    <ProfileIcon />
                                </motion.button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border">
                                            <Link to="/profile" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50">View Profile</Link>
                                            {isAdmin && (
                                                <Link
                                                    to="/admin-dashboard"
                                                    onClick={closeAllMenus}
                                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50"
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <NavLink to="/login" className="font-semibold text-slate-700 hover:text-indigo-600">Login</NavLink>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <NavLink to="/signup" className="px-5 py-2.5 text-white font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">Register</NavLink>
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <CloseIcon /> : <MenuIcon />}</button>
                </div>
            </nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden flex flex-col items-center space-y-2 p-6 bg-white border-t">
                        <NavLink to="/experience" className={mobileNavLinkClasses} onClick={closeAllMenus}>Explore</NavLink>
                        {renderHostLink(true)}
                        <NavLink to="/about" className={mobileNavLinkClasses} onClick={closeAllMenus}>About</NavLink>
                        <hr className="w-full my-2" />
                        {currentUser ? (
                            <>
                                <NavLink to="/my-experiences" className={mobileNavLinkClasses} onClick={closeAllMenus}>My Experiences</NavLink>
                                <NavLink to="/wishlist" className={mobileNavLinkClasses} onClick={closeAllMenus}>Wishlist</NavLink>
                                <NavLink to="/messages" className={mobileNavLinkClasses} onClick={closeAllMenus}>Messages</NavLink>
                                <NavLink to="/cart" className={mobileNavLinkClasses} onClick={closeAllMenus}>My Cart</NavLink>
                                <NavLink to="/profile" className={mobileNavLinkClasses} onClick={closeAllMenus}>View Profile</NavLink>

                                {isAdmin && (
                                    <NavLink to="/admin-dashboard" className={mobileNavLinkClasses} onClick={closeAllMenus}>
                                        Admin Dashboard
                                    </NavLink>
                                )}

                                <button
                                    onClick={onLogout}
                                    className="w-full py-3 text-center text-lg font-bold text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={mobileNavLinkClasses} onClick={closeAllMenus}>Login</NavLink>
                                <NavLink to="/signup" className="w-full mt-4 text-center px-5 py-2.5 text-white font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md" onClick={closeAllMenus}>Register</NavLink>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
