import api from '@/shared/services/api';

export interface Script {
    id: string; // UUID or ID from backend
    name: string;
    type: 'analytics' | 'ads' | 'pixels' | 'chat' | 'custom';
    location: 'head' | 'footer' | 'after_login';
    loadingStrategy: 'async' | 'defer' | 'lazy' | 'interaction';
    pages: 'all' | 'public' | 'auth' | 'custom';
    customRoutes?: string;
    excludedRoutes?: string;
    deviceAttributes?: ('desktop' | 'tablet' | 'mobile')[];
    environment: 'production' | 'staging' | 'development';
    content: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const ScriptService = {
    getAll: async (): Promise<Script[]> => {
        // Interceptor returns response.data directly
        const response = await api.get('/admin/scripts') as unknown as Script[];
        return response;
    },

    getById: async (id: string): Promise<Script> => {
        const response = await api.get(`/admin/scripts/${id}`) as unknown as Script;
        return response;
    },

    create: async (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> => {
        const response = await api.post('/admin/scripts', script) as unknown as Script;
        return response;
    },

    update: async (id: string, updates: Partial<Script>): Promise<Script> => {
        const response = await api.put(`/admin/scripts/${id}`, updates) as unknown as Script;
        return response;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/scripts/${id}`);
    },

    toggleStatus: async (id: string): Promise<Script> => {
        const response = await api.post(`/admin/scripts/${id}/toggle`) as unknown as Script;
        return response;
    },

    restore: async (id: string): Promise<Script> => {
        const response = await api.post(`/admin/scripts/${id}/restore`) as unknown as { script: Script };
        return response.script;
    }
};
