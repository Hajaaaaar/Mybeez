import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/profile/';

const getProfile = () => {
    return axios.get(API_URL + 'me', { headers: authHeader() });
};

const updateProfile = (profileData) => {
    return axios.put(API_URL + 'me', profileData, { headers: authHeader() });
};

const UserService = {
    getProfile,
    updateProfile,
};

export default UserService;
