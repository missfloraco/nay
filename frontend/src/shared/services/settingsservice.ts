import api from '@/shared/services/api';

// Unused SettingsData interface removed

export const SettingsService = {
    get: async () => {
        return api.get('/app/settings');
    },
    update: async (data: Record<string, any>) => {
        return api.post('/app/settings', data);
    },
    // Legacy support if needed
    getSettings: async (userType: 'admin' | 'app') => {
        return api.get(`/${userType}/settings`);
    },
    updateSettings: async (userType: 'admin' | 'app', data: Record<string, any>) => {
        return api.post(`/${userType}/settings`, data);
    }
};
