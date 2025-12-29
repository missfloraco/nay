import { ReactNode, useEffect } from 'react';
import { useSettings } from '@/shared/contexts/app-context';

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

    useEffect(() => {
        // Google Analytics
        if (settings.googleAnalyticsId && !document.getElementById('ga-script')) {
            const script1 = document.createElement('script');
            script1.id = 'ga-script';
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
            document.head.appendChild(script1);

            const script2 = document.createElement('script');
            script2.id = 'ga-config';
            script2.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalyticsId}');
            `;
            document.head.appendChild(script2);
        }

        // Google AdSense
        if (settings.adsenseId && !document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseId}`;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
    }, [settings.googleAnalyticsId, settings.adsenseId]);

    return <>{children}</>;
}
