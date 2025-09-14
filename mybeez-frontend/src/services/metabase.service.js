import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/metabase/';

const getHostDashboardUrl = () => {
    return axios.get(API_URL + 'host-dashboard-url', { headers: authHeader() });
};

// We create an object that contains our function
const MetabaseService = {
    getHostDashboardUrl,
};

// We export the entire object as the default export
export default MetabaseService;