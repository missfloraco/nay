import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/shared/contexts/app-context';
import { useLocation } from 'react-router-dom';
import { logger } from '@/shared/services/logger';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, image, type = 'website' }) => {
    const { settings } = useSettings();
    const location = useLocation();

    // 1. Resolve Global Defaults
    const SITE_TITLE = settings.seo_title || settings.appName || '';
    const SITE_DESC = settings.seo_description || 'نظام إدارة مبيعات ذكي';
    const SITE_KEYWORDS = settings.seo_keywords || 'saas, pos, inventory';

    // 2. Resolve Per-Page Data from Settings (page_seo_data is a JSON mapping of path -> metadata)
    let pageData: any = {};
    try {
        const rawPageData = typeof settings.page_seo_data === 'string'
            ? JSON.parse(settings.page_seo_data)
            : settings.page_seo_data;

        pageData = rawPageData?.[location.pathname] || {};
    } catch (e) {
        logger.warn('Failed to parse page_seo_data', e);
    }

    // 3. Final Merged Values (Priority: Prop > Page Mapping > Global Default)
    const finalTitle = title || pageData.title || SITE_TITLE;
    const finalDesc = description || pageData.description || SITE_DESC;
    const finalKeywords = keywords || pageData.keywords || SITE_KEYWORDS;
    const finalImage = image || settings.logoUrl;
    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDesc} />
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:url" content={canonicalUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={finalImage} />

            {/* Custom Tracking Scripts */}
            {settings.google_analytics && (
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics}`}></script>
            )}
            {settings.google_analytics && (
                <script>
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.google_analytics}');
          `}
                </script>
            )}

            {/* Facebook Pixel */}
            {settings.facebook_pixel && (
                <script>
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.facebook_pixel}');
            fbq('track', 'PageView');
          `}
                </script>
            )}

            {/* Custom Global Head Code */}
            {settings.seo_meta_tags && <script dangerouslySetInnerHTML={{ __html: settings.seo_meta_tags }} />}
            {settings.custom_head_code && <script dangerouslySetInnerHTML={{ __html: settings.custom_head_code }} />}
        </Helmet>
    );
};

export default SEO;
