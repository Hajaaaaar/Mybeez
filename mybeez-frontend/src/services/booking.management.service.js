import axios from 'axios';
import authHeader from './auth-header';

// The API URL was updated to match the backend controller's @RequestMapping
const API_URL = 'http://localhost:8080/api/host/bookings';

const getPendingBookings = () => {
    return axios.get(`${API_URL}/pending`, { headers: authHeader() });
};

const approveBooking = (bookingId) => {
    return axios.put(`${API_URL}/${bookingId}/approve`, {}, { headers: authHeader() });
};

const rejectBooking = (bookingId) => {
    return axios.put(`${API_URL}/${bookingId}/reject`, {}, { headers: authHeader() });
};

const BookingManagementService = {
    getPendingBookings,
    approveBooking,
    rejectBooking,
};

export default BookingManagementService;
