import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/host/dashboard';

const getDashboardData = () => {
    return axios.get(API_URL, { headers: authHeader() });
};

const HostDashboardService = {
    getDashboardData,
};

export default HostDashboardService;
