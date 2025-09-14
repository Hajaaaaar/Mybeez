import api from './api';

const getPendingExperiences = () => {
    return api.get('/admin/experiences/pending');
};

const approveExperience = (id) => {
    return api.post(`/admin/experiences/${id}/approve`);
};

const rejectExperience = (id, reason) => {
    return api.post(`/admin/experiences/${id}/reject`, { reason });
};

const AdminService = {
    getPendingExperiences,
    approveExperience,
    rejectExperience,
};

export default AdminService;