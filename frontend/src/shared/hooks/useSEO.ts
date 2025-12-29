import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

export interface SeoData {
    id?: number;
    page_key: string;
    title: string | null;
    description: string | null;
    keywords: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string;
    twitter_card: string;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;
    canonical_url: string | null;
    robots: string;
    schema_markup: any;
    is_active: boolean;
}

/**
 * Hook to fetch SEO settings for a specific page
 * @param pageKey - The unique identifier for the page (e.g., 'landing')
 * @param enabled - Whether to enable the query (default: true)
 */
export function useSEO(pageKey: string, enabled: boolean = true) {
    // Get cached SEO data from localStorage for instant display
    const getCachedSEO = (): SeoData | undefined => {
        try {
            const cached = localStorage.getItem(`seo_${pageKey}`);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            logger.error('Failed to parse cached SEO:', e);
        }
        return undefined;
    };

    return useQuery<SeoData>({
        queryKey: ['seo', pageKey],
        queryFn: async () => {
            const response = await api.get(`/public/seo/${pageKey}`);
            const seoData = response.data?.data || response.data;

            // Cache the SEO data for instant display on next load
            try {
                localStorage.setItem(`seo_${pageKey}`, JSON.stringify(seoData));
            } catch (e) {
                logger.error('Failed to cache SEO:', e);
            }

            return seoData;
        },
        initialData: getCachedSEO(), // Use cached data immediately
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
}
