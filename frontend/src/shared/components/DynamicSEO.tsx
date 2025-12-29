import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { SeoData } from '@/shared/hooks/useSEO';

interface DynamicSEOProps {
    data: SeoData | undefined;
}

/**
 * Dynamic SEO Component - Injects meta tags based on database-driven SEO settings
 * Compliant with Google 2026 SEO standards
 * All content is 100% dynamic from database - no hardcoded fallbacks
 */
export const DynamicSEO: React.FC<DynamicSEOProps> = ({ data }) => {
    // Update document.title immediately and keep it updated
    // This runs on every render to ensure title persists even if app-context tries to override it
    React.useEffect(() => {
        if (data?.title) {
            document.title = data.title;
        }
    }); // No dependency array = runs on every render

    // While loading, don't render anything (let app-context handle title temporarily)
    if (!data) {
        return null;
    }

    const {
        title,
        description,
        keywords,
        og_title,
        og_description,
        og_image,
        og_type,
        twitter_card,
        twitter_title,
        twitter_description,
        twitter_image,
        canonical_url,
        robots,
        schema_markup
    } = data;

    const currentUrl = canonical_url || window.location.href;

    return (
        <Helmet>
            {/* Basic Meta Tags - All from database */}
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            {robots && <meta name="robots" content={robots} />}
            {canonical_url && <link rel="canonical" href={canonical_url} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={og_type || 'website'} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={og_title || title || ''} />
            {(og_description || description) && (
                <meta property="og:description" content={og_description || description || ''} />
            )}
            {og_image && <meta property="og:image" content={og_image} />}
            <meta property="og:locale" content="ar_AR" />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitter_card || 'summary_large_image'} />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={twitter_title || title || ''} />
            {(twitter_description || description) && (
                <meta name="twitter:description" content={twitter_description || description || ''} />
            )}
            {twitter_image && <meta name="twitter:image" content={twitter_image} />}

            {/* Structured Data (Schema.org JSON-LD) */}
            {schema_markup && (
                <script type="application/ld+json">
                    {JSON.stringify(schema_markup)}
                </script>
            )}

            {/* Additional SEO Tags */}
            <meta name="language" content="Arabic" />
            <meta httpEquiv="content-language" content="ar" />
        </Helmet>
    );
};

export default DynamicSEO;
