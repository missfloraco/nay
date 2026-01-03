// import DOMPurify from 'dompurify';
import { logger } from '@/shared/services/logger';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * @param content Raw HTML string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (content: string): string => {
    // TODO: Uncomment lines below after installing dompurify
    // return DOMPurify.sanitize(content, {
    //     USE_PROFILES: { html: true },
    //     ADD_ATTR: ['target', 'rel']
    // });

    logger.warn('HTML Sanitization skipped: DOMPurify not installed.');
    return content;
};
