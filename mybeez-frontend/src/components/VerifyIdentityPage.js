import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const VerifyIdentityPage = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would call a service function to upload the file and submit for verification
        // e.g., UserService.submitId(file).then(...)
        setMessage("Your ID has been submitted for review. We'll notify you once it's verified.");
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Submission Received!</h2>
                    <p className="text-gray-700">{message}</p>
                    <Link to="/profile" className="mt-4 inline-block text-indigo-600 hover:underline">
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Verify Your Identity</h1>
                <p className="text-center text-gray-600 mb-6">For the safety of our community, please upload a photo of your government-issued ID. This is for internal verification only and will not be shared publicly.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700">Upload ID Document</label>
                        <input type="file" id="idDocument" onChange={(e) => setFile(e.target.files[0])} required className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                        Submit for Verification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyIdentityPage;
