import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { User, Tenant } from '@/core/models/index';

export interface TenantAuthContextType {
    user: User | null;
    tenant: Tenant | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: (shouldRedirect?: boolean) => Promise<void>;
    loading: boolean;
    forgotPassword: (email: string) => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    updateLocalUser: (data: any) => void;
    loginWithToken: (token: string) => Promise<void>;
    isImpersonating: boolean;
}

export const TenantAuthContext = createContext<TenantAuthContextType | null>(null);

export const useTenantAuth = () => {
    const context = useContext(TenantAuthContext);
    if (!context) throw new Error('useTenantAuth must be used within TenantAuthProvider');
    return context;
};

export const TenantAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);

    const loadUser = async () => {
        try {
            const res = (await api.get('/app/user', { _silent: true } as any)) as any;
            const appUser = { ...res.user, is_admin: false } as User;
            setUser(appUser);
            setTenant(res.tenant);
            return appUser;
        } catch {
            setUser(null);
            setTenant(null);
            return null;
        }
    };

    useEffect(() => {
        const init = async () => {
            // Skip auth check on public pages or admin pages
            const currentPath = window.location.pathname;
            const publicPaths = ['/403', '/login', '/register', '/forgot-password', '/reset-password', '/'];

            // Check if it's strictly a public page
            const isPublicPage = publicPaths.includes(currentPath);

            // Check if it's an admin page
            const isAdminPage = currentPath.startsWith('/admin');

            if (isPublicPage || isAdminPage || window.location.search.includes('logout=success')) {
                setLoading(false);
                return;
            }

            try {
                await initializeCsrf();
                await loadUser();
                setIsImpersonating(sessionStorage.getItem('is_impersonating') === 'true');
            } catch (err) {
                logger.warn('Tenant auth init failed', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = async (email: string, password: string) => {
        await initializeCsrf();
        const res = (await api.post('/app/login', { email, password })) as { user: any };
        const appUser = { ...res.user, is_admin: false };
        setUser(appUser);
        // In the new simplified model, the user IS the tenant
        setTenant(res.user);
    };

    const register = async (userData: any) => {
        await initializeCsrf();
        const isFormData = userData instanceof FormData;
        // In backend we expect specific fields, FormData is handled by axios automatically usually but let's be sure
        const res = (await api.post('/app/register', userData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        })) as { user: any };
        const appUser = { ...res.user, is_admin: false };
        setUser(appUser);
        setTenant(res.user);
    };

    const loginWithToken = async (token: string) => {
        setLoading(true);
        sessionStorage.setItem('tenant_token', token);
        sessionStorage.setItem('is_impersonating', 'true');
        setIsImpersonating(true);

        try {
            await loadUser();
        } catch (e) {
            logger.error('Token login failed', e);
            sessionStorage.removeItem('tenant_token');
            sessionStorage.removeItem('is_impersonating');
            setIsImpersonating(false);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (shouldRedirect = true) => {
        setLoading(true);
        try {
            // Only call backend logout if we are NOT impersonating
            // Calling it while impersonating might kill the Admin session due to shared cookie
            if (!isImpersonating) {
                await api.post('/app/logout');
            }
        } catch (e) {
            logger.error('Tenant Logout error', e);
        } finally {
            setUser(null);
            setTenant(null);
            sessionStorage.removeItem('tenant_token');
            sessionStorage.removeItem('is_impersonating');
            setIsImpersonating(false);
            if (shouldRedirect) {
                window.location.replace('/login?logout=success');
            }
        }
    };

    return (
        <TenantAuthContext.Provider value={{
            user,
            tenant,
            login,
            register,
            logout,
            loading,
            forgotPassword: async (email: string) => { await api.post('/app/forgot-password', { email }); },
            refreshUser: async () => { await loadUser(); },
            updateProfile: async (data: any) => {
                await api.post('/app/profile', data);
                await loadUser();
            },
            updateLocalUser: (data: any) => {
                if (user) {
                    setUser({ ...user, ...data });
                }
                if (tenant) {
                    setTenant({ ...tenant, ...data });
                }
            },
            loginWithToken,
            isImpersonating
        }}>
            {children}
        </TenantAuthContext.Provider>
    );
};
