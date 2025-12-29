import { useEffect } from 'react';

interface FontSettings {
    fontFamily?: string;
    customFontFile?: string | null;
    customHeadingFontFile?: string | null;
    customFontUrl?: string;
    customHeadingFontUrl?: string;
}

/**
 * Custom Hook for Font Management
 * Handles dynamic font injection and CSS variable management
 */
export function useFontManager(settings: FontSettings) {
    useEffect(() => {
        const fontFamily = settings.fontFamily || 'Default';

        // Resolve sources: Uploaded File > External URL
        const finalCustomFont = settings.customFontFile || settings.customFontUrl;
        const finalCustomHeadingFont = settings.customHeadingFontFile || settings.customHeadingFontUrl;

        const styleId = 'dynamic-font-style';
        const linkId = 'google-font-link';

        // 1. Remove old injections
        document.getElementById(styleId)?.remove();
        document.getElementById(linkId)?.remove();

        // 2. Handle Custom Fonts
        if (fontFamily === 'Custom') {
            const style = document.createElement('style');
            style.id = styleId;
            let css = '';

            // Helper to detect format
            const getFormat = (url: string) => {
                const ext = url.split('.').pop()?.toLowerCase() || '';
                if (ext.includes('woff2')) return 'woff2';
                if (ext.includes('woff')) return 'woff';
                if (ext.includes('otf')) return 'opentype';
                if (ext.includes('ttf')) return 'truetype';
                return 'woff2'; // Default modern format
            };

            // Body Font
            if (finalCustomFont) {
                const format = getFormat(finalCustomFont);
                css += `
          @font-face {
            font-family: 'CustomFont';
            src: url('${finalCustomFont}') format('${format}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
           @font-face {
            font-family: 'CustomFont';
            src: url('${finalCustomFont}') format('${format}');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
          }
        `;
                document.documentElement.style.setProperty('--theme-font', "'CustomFont', sans-serif");
                document.body.style.fontFamily = "'CustomFont', sans-serif";
            }

            // Heading Font
            if (finalCustomHeadingFont) {
                const format = getFormat(finalCustomHeadingFont);
                css += `
           @font-face {
             font-family: 'CustomHeadingFont';
             src: url('${finalCustomHeadingFont}') format('${format}');
             font-weight: normal;
             font-style: normal;
             font-display: swap;
           }
            @font-face {
             font-family: 'CustomHeadingFont';
             src: url('${finalCustomHeadingFont}') format('${format}');
             font-weight: bold;
             font-style: normal;
             font-display: swap;
           }
         `;
                document.documentElement.style.setProperty('--theme-font-heading', "'CustomHeadingFont', sans-serif");
            } else if (finalCustomFont) {
                // Fallback to body font if no specific heading font
                document.documentElement.style.setProperty('--theme-font-heading', "'CustomFont', sans-serif");
            }

            // Apply Heading Font to Elements
            css += `
        h1, h2, h3, h4, h5, h6, .font-heading {
            font-family: var(--theme-font-heading, var(--theme-font, sans-serif)) !important;
        }
      `;

            style.innerHTML = css;
            document.head.appendChild(style);

        } else {
            // Reset to system default
            document.documentElement.style.removeProperty('--theme-font');
            document.documentElement.style.removeProperty('--theme-font-heading');
            document.body.style.removeProperty('font-family');
        }
    }, [settings.fontFamily, settings.customFontFile, settings.customHeadingFontFile, settings.customFontUrl, settings.customHeadingFontUrl]);
}
