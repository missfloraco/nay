import api from '@/shared/services/api';

export const DashboardService = {
    getStats: async () => {
        return api.get('/app/dashboard/stats');
    }
};
