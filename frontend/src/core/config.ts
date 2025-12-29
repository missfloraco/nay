// System-wide Configuration & Branding Labels
export const API_ROOT_URL = import.meta.env.VITE_API_ROOT || '';
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_ROOT_URL}/api`;
export const APP_BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export const SYSTEM_LABELS = {
    appDescription: 'نظام إدارة المبيعات والمخزون المتكامل'
};
