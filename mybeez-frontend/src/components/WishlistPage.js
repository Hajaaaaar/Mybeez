import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WishlistService from '../services/wishlist.service';
import AuthService from '../services/auth.service';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [currentUser] = useState(AuthService.getCurrentUser());

    useEffect(() => {
        if (currentUser) {
            WishlistService.getWishlist()
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setWishlist(response.data);
                        console.log(response.data)
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch wishlist:", error);
                    if (error.response && error.response.status === 401) {
                        AuthService.logout();
                        navigate("/login");
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [currentUser, navigate]);

    const handleRemoveFromWishlist = async (wishlistItemId) => {
        try {
            await WishlistService.removeFromWishlist(wishlistItemId);
            setWishlist(prevWishlist => prevWishlist.filter(item => item.wishlistItemId !== wishlistItemId));
        } catch (err) {
            console.error("Failed to remove item from wishlist", err);
        }
    };

    if (loading) {
        return <div className="text-center py-20 font-semibold text-slate-500">Loading your wishlist...</div>;
    }

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-slate-800">My Wishlist</h1>
                <p className="mt-4 text-slate-600">
                    Please <Link to="/login" className="text-indigo-600 hover:underline font-bold">log in</Link> to view your wishlist.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
                    Your Wishlist
                </h2>

                {Array.isArray(wishlist) && wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlist.map((item) => (
                            <div key={item.wishlistItemId} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1">
                                <Link to={`/experience/${item.experienceId}`}>
                                    <img
                                        src={`${item.images?.[0].url}`}
                                        alt={item.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-base text-gray-600 my-3">
                                         {item.location
                                     ? `${item.location.address}, ${item.location.city} ${item.location.postcode}`
                                         : 'Unknown location'}
                                         </p>

                                    <div className="flex-grow"></div>

                                    <div
                                        className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                                    <button
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                            onClick={() => handleRemoveFromWishlist(item.wishlistItemId)}
                                        >
                                            Remove
                                        </button>
                                        <Link to={`/experience/${item.experienceId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 text-lg">Your wishlist is empty. Start exploring and add some experiences!</p>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;