import axios, { AxiosError } from 'axios';
import { API_ROOT_URL, API_BASE_URL } from '@/core/config';
import { logger } from './logger';

// 1. Enforce Global Defaults
axios.defaults.withCredentials = true;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout to prevent hanging requests
    headers: {
        'Accept': 'application/json',
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Helper to get cookie by name
function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Request interceptor to manually set CSRF header and Auth Token
api.interceptors.request.use(config => {
    // 1. CSRF Token
    if (!config.headers['X-XSRF-TOKEN']) {
        const token = getCookie('XSRF-TOKEN');
        if (token) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
    }

    // 2. Bearer Token (Only for Tenant App routes to prevent leaking to Admin panel)
    const authToken = sessionStorage.getItem('tenant_token') || localStorage.getItem('tenant_token');
    const isAppRequest = config.url?.includes('/app/') || config.url?.includes('/public/');

    if (authToken && isAppRequest && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

// Track CSRF initialization
let csrfInitialized = false;
let csrfInitializing: Promise<void> | null = null;

/**
 * Initialize CSRF token by calling /sanctum/csrf-cookie
 * Uses global axios instance to bypass interceptors logic
 */
export const initializeCsrf = async (retryCount = 0): Promise<void> => {
    if (csrfInitialized) return;
    if (csrfInitializing && retryCount === 0) return csrfInitializing;

    csrfInitializing = (async () => {
        try {
            // Ensure we use the correct root URL for Sanctum
            const root = API_ROOT_URL || window.location.origin;
            await axios.get(`${root}/sanctum/csrf-cookie`, {
                withCredentials: true,
                timeout: 10000 // 10s timeout
            });
            csrfInitialized = true;
            csrfInitializing = null;
        } catch (error) {
            logger.error(`CSRF Init Attempt ${retryCount + 1} Failed`, error);
            csrfInitializing = null;

            if (retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 1500 * (retryCount + 1)));
                return initializeCsrf(retryCount + 1);
            }
            throw error;
        }
    })();

    return csrfInitializing;
};

/**
 * Reset CSRF state (call after logout or 419 errors)
 */
export const resetCsrf = () => {
    csrfInitialized = false;
};

/**
 * Legacy CSRF cookie helper for backward compatibility
 * @deprecated Use initializeCsrf() instead
 */
export const getCsrfCookie = initializeCsrf;

/**
 * Global Toast Trigger (for use within non-component files)
 */
const triggerGlobalToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }));
};

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const responseData = error.response?.data as any;

        // Handle 419 CSRF Token Mismatch
        if (error.response?.status === 419 && !originalRequest._csrfRetry) {
            originalRequest._csrfRetry = true;

            try {
                // Reset and reinitialize CSRF
                resetCsrf();
                await initializeCsrf();

                // Small delay to ensure cookie is set
                await new Promise(resolve => setTimeout(resolve, 100));

                // Retry original request
                return api(originalRequest);
            } catch (csrfError) {
                logger.error('CSRF retry failed', csrfError);
                return Promise.reject(csrfError);
            }
        }

        // Handle 422 Unprocessable Entity (Validation Errors)
        if (error.response?.status === 422) {
            // Extract first error message for common usage
            if (responseData?.errors) {
                const firstError = Object.values(responseData.errors)[0] as string[];
                if (firstError && firstError.length > 0) {
                    (error as any).errorMessage = firstError[0];
                }
            }
            if (!(error as any).errorMessage) {
                (error as any).errorMessage = responseData?.message || 'بيانات المدخلات غير صالحة';
            }
        }

        // Handle 403 Forbidden (likely auth issue)
        if (error.response?.status === 403) {
            const currentPath = window.location.pathname;
            const requestUrl = error.config?.url || '';

            // Don't redirect if:
            // 1. Already on /403 page
            // 2. On public pages (/, /login, /register)
            // 3. The request itself was for CSRF or login/me (let the context handle it)
            const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/403'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

            const isAuthRequest = requestUrl.includes('csrf-cookie') ||
                requestUrl.includes('/auth/login') ||
                requestUrl.includes('/admin/login') ||
                requestUrl.includes('/app/login') ||
                requestUrl.includes('/me') ||
                requestUrl.includes('/user');

            if (!isPublicPath && !isAuthRequest && !currentPath.includes('/403') && !originalRequest._silent) {
                logger.error('403 Forbidden - Redirecting to /403');
                setTimeout(() => {
                    window.location.href = '/403';
                }, 100);
            } else {
                if (!originalRequest._silent) {
                    logger.warn('403 Forbidden on public/auth/forbidden page - Not redirecting');
                }
            }
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

            if (!isPublicPath && !originalRequest._silent) {
                logger.warn('401 Unauthorized - Redirecting to login');
                // Use replace to avoid back-button loops
                window.location.replace('/login?error=session_expired');
            }
        }

        // Handle 500+ Internal Server Errors
        if (error.response?.status && error.response.status >= 500 && !originalRequest._skipGlobalError && !originalRequest._silent) {
            triggerGlobalToast('حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً', 'error');
        }

        return Promise.reject(error);
    }
);

export const BASE_URL = API_BASE_URL;
export default api;
