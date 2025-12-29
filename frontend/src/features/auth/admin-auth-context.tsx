import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { initializeCsrf } from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { User } from '@/core/models/index';

export interface AdminAuthContextType {
    user: User | null;
    login: (email: string, password: string, options?: { _silent?: boolean }) => Promise<void>;
    logout: () => void;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async (retryCount = 0) => {
        try {
            const res = (await api.get('/admin/user')) as { user: any };
            const admin = { ...res.user, is_admin: true } as User;
            setUser(admin);
            return admin;
        } catch (err: any) {
            logger.error(`Admin loadUser attempt ${retryCount + 1} failed`, err);

            // Handle 401/403 specifically - no retry needed as session is invalid
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setUser(null);
                return null;
            }

            if (retryCount < 2) {
                // Wait and retry for network errors or transient 500s
                return new Promise(resolve => {
                    setTimeout(() => resolve(loadUser(retryCount + 1)), 1000);
                });
            }

            setUser(null);
            return null;
        }
    };

    useEffect(() => {
        const init = async () => {
            // Skip auth check on public pages or tenant pages to avoid infinite loops and unnecessary errors
            const publicPaths = ['/403', '/login', '/register', '/forgot-password', '/reset-password', '/', '/app'];
            const isPublicPage = publicPaths.some(path => window.location.pathname === path || window.location.pathname.startsWith(path + '/'));

            if (isPublicPage || window.location.search.includes('logout=success')) {
                setLoading(false);
                return;
            }

            try {
                // CSRF for admin path (handled by GuardSessionIsolator on server)
                await initializeCsrf();
                await loadUser();
            } catch (err) {
                logger.warn('Admin auth init failed', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = async (email: string, password: string, options: { _silent?: boolean } = {}) => {
        await initializeCsrf();
        const res = (await api.post('/admin/login', { email, password }, options as any)) as { user: any };
        setUser({ ...res.user, is_admin: true });
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/admin/logout');
        } catch (e) {
            logger.error('Admin Logout error', e);
        } finally {
            setUser(null);
            window.location.replace('/login?logout=success');
        }
    };

    return (
        <AdminAuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            refreshUser: async () => { await loadUser(); }
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
