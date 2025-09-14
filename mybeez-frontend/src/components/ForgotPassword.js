import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        setIsSuccess(false);

        axios.post("http://localhost:8080/api/auth/forgot-password", { email })
            .then(response => {
                setMessage(response.data);
                setIsSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                setMessage("If an account with this email exists, a password reset link has been sent.");
                setIsSuccess(true);
                setLoading(false);
            });
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Forgot Password</h1>
                <p className="text-center text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                            required
                            aria-required="true"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                {message && (
                    <div role="alert" aria-live="assertive" className={`mt-4 text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </div>
                )}
                <p className="mt-6 text-center text-sm">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}


