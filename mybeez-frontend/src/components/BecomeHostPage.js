import React from 'react';
import { Link } from 'react-router-dom';

const BecomeHostPage = () => {
    return (
        <div className="bg-gray-50 flex flex-col items-center justify-center text-center p-8" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            <h1 className="text-5xl font-bold text-gray-800">Join a Community of Hosts</h1>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl">
                Share your passion, meet new people, and earn money by hosting unique experiences on Mybeez. We provide the tools and support to help you succeed.
            </p>
            <Link to="/become-a-host/apply">
                <button className="mt-8 bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-indigo-700 transition duration-300">
                    Let's Get Started
                </button>
            </Link>
        </div>
    );
};

export default BecomeHostPage;
