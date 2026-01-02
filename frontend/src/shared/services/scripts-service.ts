import api from './api';

export interface Script {
    id: string;
    name: string;
    type: 'script' | 'pixel' | 'meta';
    location: 'header' | 'body' | 'footer';
    content: string;
    isActive: boolean;
    environment: 'production' | 'development' | 'staging';
    trigger?: 'all' | 'specific_pages';
    pages?: string[];
    createdAt: string;
    updatedAt: string;
}

export const ScriptService = {
    getAll: async (): Promise<Script[]> => {
        const response: any = await api.get('/admin/scripts');
        return response.data || response;
    },

    create: async (data: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> => {
        const response: any = await api.post('/admin/scripts', data);
        return response.data || response;
    },

    update: async (id: string, data: Partial<Script>): Promise<Script> => {
        const response: any = await api.put(`/admin/scripts/${id}`, data);
        return response.data || response;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/scripts/${id}`);
    },

    restore: async (id: string): Promise<void> => {
        await api.post(`/admin/scripts/${id}/restore`);
    },

    toggleStatus: async (id: string): Promise<Script> => {
        const response: any = await api.post(`/admin/scripts/${id}/toggle`);
        return response.data || response;
    }
};
