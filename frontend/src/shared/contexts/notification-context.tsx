import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

export type NotificationLevel = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
    id: string | number;
    uid?: string;
    level: NotificationLevel;
    title?: string;
    message: string;
    action_url?: string;
    icon?: any;
    is_read?: boolean;
    created_at?: string;
    created_human?: string;
    persistent?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

interface NotificationContextType {
    notifications: AppNotification[];
    activeToasts: AppNotification[];
    unreadCount: number;
    unreadCounts: {
        total: number;
        support: number;
        billing: number;
        tenants: number;
    };
    loading: boolean;
    notify: (options: {
        message: string;
        title?: string;
        level?: NotificationLevel;
        persistent?: boolean;
        action_url?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
    }) => void;
    markAsRead: (id: string | number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string | number) => Promise<void>;
    deleteNotifications: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    handleNotificationClick: (notification: AppNotification) => Promise<void>;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
    // Compatibility aliases
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadCounts, setUnreadCounts] = useState({ total: 0, support: 0, billing: 0, tenants: 0 });
    const lastUnreadCountRef = React.useRef(0);
    const [loading, setLoading] = useState(false);
    const hasInitialFetchRef = React.useRef(false);
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);
    const successAudioRef = React.useRef<HTMLAudioElement | null>(null);
    const errorAudioRef = React.useRef<HTMLAudioElement | null>(null);

    // Initialize audio on mount
    useEffect(() => {
        successAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        successAudioRef.current.volume = 0.5;
        successAudioRef.current.load();

        errorAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        errorAudioRef.current.volume = 0.4;
        errorAudioRef.current.load();
    }, []);

    const playSound = useCallback((level: NotificationLevel = 'info') => {
        const audio = (level === 'error' || level === 'warning') ? errorAudioRef.current : successAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => logger.warn('Sound playback blocked', err));
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const pathname = window.location.pathname;
            const isAdmin = pathname.includes('/admin') || pathname.startsWith('admin');
            const prefix = isAdmin ? 'admin' : 'app';

            const response = await api.get(`${prefix}/notifications`) as any;

            let notificationsList = [];
            if (response?.notifications) {
                notificationsList = Array.isArray(response.notifications)
                    ? response.notifications
                    : (response.notifications.data || []);
            }

            const newUnreadCount = response?.unread_count ?? 0;
            const newUnreadCounts = response?.unread_counts ?? { total: newUnreadCount, support: 0, billing: 0 };

            if (hasInitialFetchRef.current && newUnreadCount > lastUnreadCountRef.current) {
                const newest = notificationsList[0];
                playSound(newest?.level || 'info');
            }

            lastUnreadCountRef.current = newUnreadCount;
            setNotifications(notificationsList);
            setUnreadCount(newUnreadCount);
            setUnreadCounts(newUnreadCounts);
            hasInitialFetchRef.current = true;
        } catch (error) {
            logger.error('Failed to fetch notifications', error);
        }
    }, [playSound]);

    const notify = useCallback((options: {
        message: string;
        title?: string;
        level?: NotificationLevel;
        persistent?: boolean;
        action_url?: string;
        action?: {
            label: string;
            onClick: () => void;
        };
    }) => {
        const { message, title, level = 'info', action_url, action } = options;
        const id = Math.random().toString(36).substring(2, 9);

        const newNotification: AppNotification = {
            id,
            message,
            title,
            level,
            action_url,
            action,
            persistent: false,
            created_at: new Date().toISOString(),
            created_human: 'الآن'
        };

        setActiveToasts(prev => [...prev, newNotification]);
        playSound(level);

        setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, [playSound]);

    // Convenience methods
    const showSuccess = useCallback((message: string) => notify({ message, level: 'success' }), [notify]);
    const showError = useCallback((message: string) => notify({ message, level: 'error' }), [notify]);
    const showInfo = useCallback((message: string) => notify({ message, level: 'info' }), [notify]);

    const markAsRead = useCallback(async (id: string | number) => {
        try {
            const pathname = window.location.pathname;
            const isAdmin = pathname.includes('/admin') || pathname.startsWith('admin');
            const prefix = isAdmin ? 'admin' : 'app';
            await api.post(`${prefix}/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            // Trigger a re-fetch of totals to be safe, or local update
            fetchNotifications();
        } catch (error) {
            logger.error('Failed to mark notification as read', error);
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            const pathname = window.location.pathname;
            const isAdmin = pathname.includes('/admin') || pathname.startsWith('admin');
            const prefix = isAdmin ? 'admin' : 'app';
            await api.post(`${prefix}/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            fetchNotifications();
        } catch (error) {
            logger.error('Failed to mark all as read', error);
        }
    }, [fetchNotifications]);

    const deleteNotification = useCallback(async (id: string | number) => {
        try {
            const pathname = window.location.pathname;
            const isAdmin = pathname.includes('/admin') || pathname.startsWith('admin');
            const prefix = isAdmin ? 'admin' : 'app';
            await api.delete(`${prefix}/notifications/${id}`);

            setNotifications(prev => prev.filter(n => n.id !== id));

            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            fetchNotifications();
        } catch (error: any) {
            if (error?.response?.status === 404 || error?.status === 404) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                const deleted = notifications.find(n => n.id === id);
                if (deleted && !deleted.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                return;
            }
            logger.error('Failed to delete notification', error);
        }
    }, [notifications, fetchNotifications]);

    const deleteNotifications = useCallback(async () => {
        try {
            const pathname = window.location.pathname;
            const isAdmin = pathname.includes('/admin') || pathname.startsWith('admin');
            const prefix = isAdmin ? 'admin' : 'app';
            await api.delete(`${prefix}/notifications/delete-all`);
            setNotifications([]);
            setUnreadCount(0);
            setUnreadCounts({ total: 0, support: 0, billing: 0, tenants: 0 });
            fetchNotifications();
        } catch (error) {
            logger.error('Failed to delete all notifications', error);
        }
    }, [fetchNotifications]);

    const handleNotificationClick = useCallback(async (notif: AppNotification) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
        }

        if (notif.action_url) {
            if (notif.action_url.startsWith('http')) {
                window.open(notif.action_url, '_blank');
            } else {
                window.dispatchEvent(new CustomEvent('app:navigate', { detail: { path: notif.action_url } }));
            }
        }

        if (notif.action?.onClick) {
            notif.action.onClick();
        }
    }, [markAsRead]);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({ options, resolve });
        });
    }, []);

    useEffect(() => {
        const handleGlobalToast = (e: any) => {
            const { message, level, type } = e.detail;
            notify({ message, level: level || type || 'info' });
        };
        window.addEventListener('app:toast', handleGlobalToast as any);
        return () => window.removeEventListener('app:toast', handleGlobalToast as any);
    }, [notify]);

    useEffect(() => {
        const isAuthPage = window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register') ||
            window.location.pathname === '/' ||
            window.location.pathname === '';

        if (!isAuthPage) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            const handleFocus = () => fetchNotifications();
            window.addEventListener('focus', handleFocus);
            return () => {
                clearInterval(interval);
                window.removeEventListener('focus', handleFocus);
            };
        }
    }, [fetchNotifications]);

    const contextValue = useMemo(() => ({
        notifications,
        activeToasts,
        unreadCount,
        unreadCounts,
        loading,
        notify,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        handleNotificationClick,
        showConfirm,
        showSuccess,
        showError,
        showInfo
    }), [
        notifications,
        activeToasts,
        unreadCount,
        unreadCounts,
        loading,
        notify,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        handleNotificationClick,
        showConfirm,
        showSuccess,
        showError,
        showInfo
    ]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            <div className="fixed bottom-0 right-0 z-[9999] flex flex-col gap-2 p-4 pointer-events-none">
                {activeToasts.map(toast => (
                    <ToastComponent
                        key={toast.id}
                        notification={toast}
                        handleNotificationClick={handleNotificationClick}
                        onClose={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div>

            {confirmState && (
                <ConfirmationModalPortal
                    options={confirmState.options}
                    onConfirm={() => {
                        confirmState.resolve(true);
                        setConfirmState(null);
                    }}
                    onCancel={() => {
                        confirmState.resolve(false);
                        setConfirmState(null);
                    }}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastComponent: React.FC<{
    notification: AppNotification,
    handleNotificationClick: (n: AppNotification) => void,
    onClose: () => void
}> = ({ notification, handleNotificationClick, onClose }) => {
    const { level, message, title } = notification;

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    };

    const bgColors = {
        success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-500/20',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-500/20',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-500/20'
    };

    return (
        <div
            onClick={() => {
                handleNotificationClick(notification);
                onClose();
            }}
            className={`
                w-[320px] pointer-events-auto animate-in slide-in-from-right-full duration-500
                rounded-2xl border p-4 shadow-xl backdrop-blur-md flex gap-3 cursor-pointer group/toast
                ${bgColors[level]}
            `}
        >
            <div className="shrink-0 group-hover/toast:scale-110 transition-transform">{icons[level]}</div>
            <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{title}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">{message}</p>
                {notification.action && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                            onClose();
                        }}
                        className="mt-2 text-xs font-black text-primary hover:underline block"
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors h-fit"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

import ConfirmationModal from '@/shared/ui/modals/confirmation-modal';
const ConfirmationModalPortal = ({ options, onConfirm, onCancel }: { options: ConfirmOptions, onConfirm: () => void, onCancel: () => void }) => {
    return (
        <ConfirmationModal
            isOpen={true}
            title={options.title}
            message={options.message}
            confirmLabel={options.confirmLabel}
            cancelLabel={options.cancelLabel}
            variant={options.variant || (options.isDestructive ? 'danger' : 'warning')}
            onConfirm={onConfirm}
            onClose={onCancel}
        />
    );
};
