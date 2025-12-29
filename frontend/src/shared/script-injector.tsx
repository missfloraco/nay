import { useEffect } from 'react';
import { useSettings } from '@/shared/contexts/app-context';

/**
 * ScriptInjector Component
 * Dynamically injects custom head and footer scripts from settings
 */
export default function ScriptInjector() {
    const { settings } = useSettings();

    useEffect(() => {
        // Safety check: only proceed if settings exist
        if (!settings) return;

        const customHeadCode = settings.custom_head_code;
        const customFooterCode = settings.custom_footer_code;

        // Inject Head Scripts
        if (customHeadCode && customHeadCode.trim()) {
            const headScript = document.createElement('div');
            headScript.innerHTML = customHeadCode;
            headScript.id = 'custom-head-scripts';

            // Remove old scripts if exist
            const oldHead = document.getElementById('custom-head-scripts');
            if (oldHead) oldHead.remove();

            document.head.appendChild(headScript);
        }

        // Inject Footer Scripts (before </body>)
        if (customFooterCode && customFooterCode.trim()) {
            const footerScript = document.createElement('div');
            footerScript.innerHTML = customFooterCode;
            footerScript.id = 'custom-footer-scripts';

            // Remove old scripts if exist
            const oldFooter = document.getElementById('custom-footer-scripts');
            if (oldFooter) oldFooter.remove();

            document.body.appendChild(footerScript);
        }

        // Cleanup on unmount
        return () => {
            const headScripts = document.getElementById('custom-head-scripts');
            const footerScripts = document.getElementById('custom-footer-scripts');
            if (headScripts) headScripts.remove();
            if (footerScripts) footerScripts.remove();
        };
    }, [settings?.custom_head_code, settings?.custom_footer_code]);

    return null; // This component doesn't render anything
}
