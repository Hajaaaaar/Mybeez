import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;
        setMessage('');
        setLoading(true);

        try {
            const normalisedEmail = email.trim().toLowerCase();

            // 1) log in
            const resp = await AuthService.login(normalisedEmail, password);
            onLoginSuccess?.();

            // 2) get the role (pick ONE of the approaches below)
            // A) If your AuthService.login returns { role: 'ADMIN' | 'HOST' | 'USER' }
            const roleFromLogin = resp?.role;

            // B) Otherwise, fetch from /api/auth/me after the token is stored by AuthService
            const me = roleFromLogin ? null : await AuthService.me();
            const role = roleFromLogin ?? me?.role;

            // 3) honour any pre-set redirect first (e.g., when a protected route set it)
            const redirectUrl = sessionStorage.getItem('loginRedirectUrl');

            if (redirectUrl) {
                sessionStorage.removeItem('loginRedirectUrl');
                navigate(redirectUrl);
            } else if (role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (role === 'HOST') {
                navigate('/host-dashboard');
            } else {
                navigate('/'); // your original default
            }
        } catch (error) {
            const resMessage =
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                error.toString();
            setMessage(resMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
            <div className="relative w-full max-w-4xl min-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                <div className="relative bg-indigo-600 w-full md:w-1/2 h-64 md:h-auto p-8 text-white flex flex-col justify-between">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold">MyBeez</h1>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Shared Passions. Unforgettable Experiences.</h2>
                        <p className="mt-4 text-indigo-200">Join a community of Hosts and Explorers.</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                        <p className="text-gray-500 mb-8">Log in to continue your journey.</p>
                        <form onSubmit={handleLogin}>
                            <div className="mt-4">
                                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., jane.doe@example.com"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    id="login-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                                >
                                    {loading ? 'Logging In...' : 'Log In'}
                                </button>
                            </div>
                        </form>
                        {message && (
                            <div className="mt-4 p-3 text-center text-sm text-red-800 bg-red-100 rounded-md" role="alert">
                                {message}
                            </div>
                        )}
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
