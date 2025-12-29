import api from './api';
import { logger } from './logger';

export interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: 'tenant' | 'user';
    image?: string;
    url: string;
}

export const SearchService = {
    globalSearch: async (query: string): Promise<SearchResult[]> => {
        // Simple logic: if in admin use admin endpoint, otherwise could be tenant endpoint
        const isAdmin = window.location.pathname.startsWith('/admin');
        const endpoint = isAdmin ? '/admin/search' : '/app/search';
        // Note: For now only implemented admin search. Tenant search can return local data.

        try {
            const response = await api.get(`${endpoint}?q=${encodeURIComponent(query)}`);
            // Interceptor returns response.data, so response IS the data object
            return (response as any).results || [];
        } catch (e) {
            logger.error("Search failed", e);
            return [];
        }
    }
};
