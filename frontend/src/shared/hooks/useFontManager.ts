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
 * 
 * CORE RULES:
 * 1. Default system font is "IBM Plex Sans Arabic" (set in global.css)
 * 2. If Custom Font is active, we override --font-base
 * 3. No hardcoded font-family removal on body (we use variables)
 */
export function useFontManager(settings: FontSettings) {
    useEffect(() => {
        const fontFamily = settings.fontFamily || 'Default';

        // Resolve sources: Uploaded File > External URL
        const finalCustomFont = settings.customFontFile || settings.customFontUrl;
        const finalCustomHeadingFont = settings.customHeadingFontFile || settings.customHeadingFontUrl;

        const styleId = 'dynamic-font-style';
        const linkId = 'google-font-link';

        // 1. Remove old injections to ensure clean slate
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

            // Body Font Configuration
            if (finalCustomFont) {
                const format = getFormat(finalCustomFont);
                // Define the @font-face for the custom font
                css += `
          @font-face {
            font-family: 'CustomFont';
            src: url('${finalCustomFont}') format('${format}');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `;
                // OVERRIDE the global variable
                // This updates Tailwind's font-sans dynamically
                document.documentElement.style.setProperty('--font-base', "'CustomFont', sans-serif");
            }

            // Heading Font Configuration (Optional)
            // If provided, we can define a secondary variable or just use it for headings
            // For now, adhering to strict "One source of truth" unless specific heading override is requested
            // But preserving existing heading logic just in case, mapped to a variable if needed.
            // Current requirement says: "One source of truth for font selection" -> implies primarily --font-base

            // However, keeping the heading logic for backward consistency if headings used --theme-font-heading
            // We will map it to --font-base if not set, or custom if set.

            if (finalCustomHeadingFont) {
                const format = getFormat(finalCustomHeadingFont);
                css += `
            @font-face {
              font-family: 'CustomHeadingFont';
              src: url('${finalCustomHeadingFont}') format('${format}');
              font-weight: 100 900;
              font-style: normal;
              font-display: swap;
            }
          `;
                document.documentElement.style.setProperty('--font-heading', "'CustomHeadingFont', sans-serif");
            } else {
                // Fallback: Headings use the same base font
                document.documentElement.style.removeProperty('--font-heading');
            }

            // Inject the dynamic CSS
            style.innerHTML = css;
            document.head.appendChild(style);

        } else {
            // 3. Google Fonts / System Fonts
            if (fontFamily !== 'Default' && fontFamily !== 'IBM Plex Sans Arabic') {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                // Replace spaces with + for URL
                const fontName = fontFamily.replace(/ /g, '+');
                // Request a broad range of weights
                link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@200;300;400;500;600;700;800;900&display=swap`;
                document.head.appendChild(link);

                // Override global font variable
                document.documentElement.style.setProperty('--font-base', `"${fontFamily}", sans-serif`);
            } else {
                // Return to default (IBM Plex Sans Arabic is already imported in global.css)
                document.documentElement.style.removeProperty('--font-base');
            }

            // Clean up custom/heading overrides
            document.documentElement.style.removeProperty('--font-heading');
            document.body.style.removeProperty('font-family');
        }
    }, [settings.fontFamily, settings.customFontFile, settings.customHeadingFontFile, settings.customFontUrl, settings.customHeadingFontUrl]);
}
