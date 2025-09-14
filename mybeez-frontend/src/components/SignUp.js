import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import AuthService from '../services/auth.service';

const SignUp = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignUp = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        AuthService.signup(firstName, lastName, email, password).then(
            (response) => {
                setMessage("Registration successful! Redirecting to login...");
                setLoading(false);

                // Wait 2 seconds (2000 milliseconds) then navigate to the login page
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            },
            (error) => {
                const resMessage = (error.response?.data) || error.message || error.toString();
                setMessage(resMessage);
                setLoading(false);
            }
        );
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
            <div className="relative w-full max-w-4xl min-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                <div className="relative bg-indigo-600 w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center p-8 text-white flex flex-col justify-between">
                    <div className="absolute inset-0 bg-indigo-600 opacity-60"></div>
                    <div className="relative z-10"><h1 className="text-3xl font-bold">MyBeez</h1></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Shared Passions. Unforgettable Experiences.</h2>
                        <p className="mt-4 text-indigo-200">Join a community of Hosts and Explorers.</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h2>
                        <p className="text-gray-500 mb-8">Let's get you started!</p>
                        <form onSubmit={handleSignUp}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Jane" required />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Doe" required />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., jane.doe@example.com" required />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" required />
                            </div>
                            <div className="mt-8">
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                        {message && (
                            <div className="mt-4 p-3 text-center text-sm text-green-800 bg-green-200 rounded-md">
                                {message}
                            </div>
                        )}
                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
