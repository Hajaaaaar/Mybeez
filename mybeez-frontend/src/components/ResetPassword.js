import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        setIsSuccess(false);

        axios.post(`http://localhost:8080/api/auth/reset-password?token=${token}`, { password })
            .then(response => {
                // --- THIS IS THE FIX ---
                // The backend sends { "message": "..." }, so we access response.data.message
                setMessage(response.data.message);
                setIsSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                // --- THIS IS ALSO THE FIX ---
                // The error response also contains a 'message' property
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    "An unknown error occurred.";

                setMessage(resMessage);
                setIsSuccess(false);
                setLoading(false);
            });
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Reset Your Password</h1>
                {!isSuccess && (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                                required
                                aria-required="true"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
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
