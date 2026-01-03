import api from '@/shared/services/api';

export interface Ad {
    id?: number;
    name: string;
    placement: string;
    type: 'script' | 'image' | 'html';
    content: string;
    redirect_url?: string;
    is_active: boolean;
    stats?: {
        impressions: number;
        clicks: number;
    };
}

export const AdsService = {
    getAll: async () => {
        const response = await api.get('/admin/ads');
        return response as unknown as Ad[];
    },

    getActive: async () => {
        const response = await api.get('/ads/active');
        return response as unknown as Record<string, Ad[]>;
    },

    create: async (data: Ad) => {
        const response = await api.post('/admin/ads', data);
        return response;
    },

    update: async (id: number, data: Partial<Ad>) => {
        const response = await api.put(`/admin/ads/${id}`, data);
        return response;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/admin/ads/${id}`);
        return response;
    },

    restore: async (id: number) => {
        const response = await api.post(`/admin/ads/${id}/restore`);
        return response;
    },

    toggleAdBlock: async (enabled: boolean) => {
        return api.post('/admin/ads/toggle-adblock', { enabled });
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/admin/ads/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response as unknown as { url: string };
    }
};
