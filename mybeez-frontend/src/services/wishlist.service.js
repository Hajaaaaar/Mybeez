import axios from 'axios';
import authHeader from './auth-header'; // We need this to send the JWT token

const API_URL = "/api/wishlist";

// Fetches all items in the user's wishlist
const getWishlist = () => {
    return axios.get(API_URL, { headers: authHeader() });
};

// Adds an experience to the wishlist
const addToWishlist = (experienceId) => {
    return axios.post(`${API_URL}/${experienceId}`, null, { headers: authHeader() });
};

// Removes an item from the wishlist
const removeFromWishlist = (wishlistItemId) => {
    return axios.delete(`${API_URL}/${wishlistItemId}`, { headers: authHeader() });
};

const WishlistService = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};

export default WishlistService;