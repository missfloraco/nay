export const formatNumber = (num: number | string | undefined | null): string => {
    if (num === undefined || num === null || num === '') return '0';
    // Ensure input is a number
    const n = Number(num);
    if (isNaN(n)) return '0';
    // Use en-US locale to force English digits
    return n.toLocaleString('en-US');
};

export const formatDate = (dateString: string | undefined | null, includeTime: boolean = false) => {
    if (!dateString) return '-';
    // Handle 'Invalid Date' or incomplete strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    // Force English digits by treating components as numbers
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();

    let formatted = `${d}/${m}/${y}`; // DD/MM/YYYY

    if (includeTime) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        // Use standard AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const h = hours.toString().padStart(2, '0');
        formatted += ` ${h}:${minutes} ${ampm}`;
    }

    return formatted;
};

export const getLocalDate = () => {
    const d = new Date();
    // Format to YYYY-MM-DD using local time
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export const roundCurrency = (amount: number) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};

import { API_ROOT_URL } from '@/core/config';

export const resolveAssetUrl = (url: string | undefined | null) => {
    if (!url || typeof url !== 'string' || url === 'null' || url === '[]') return null;
    if (url.startsWith('http')) return url;

    // Remove leading slashes for normalization
    let cleanUrl = url.replace(/^\/+/, '');

    // If it's already a relative path starting with 'storage/' or 'public/', just ensure it has a single leading slash
    if (cleanUrl.startsWith('storage/') || cleanUrl.startsWith('public/')) {
        return `/${cleanUrl}`;
    }

    // Otherwise, prepend 'storage/' and return with leading slash
    return `/storage/${cleanUrl}`;
};
