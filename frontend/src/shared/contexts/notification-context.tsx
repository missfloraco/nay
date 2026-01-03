import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

export type NotificationLevel = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
    id: string | number;
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
    fetchNotifications: () => Promise<void>;
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
            // Determine prefix based on current path
            const isAdmin = window.location.pathname.startsWith('/admin');
            const prefix = isAdmin ? '/admin' : '/app';

            const response = await api.get(`${prefix}/notifications`) as any;

            // The api service interceptor already returns response.data directly
            const notificationsList = response?.notifications || [];
            const newUnreadCount = response?.unread_count || 0;

            // If unread count increased and it's not the first load, play sound
            if (hasInitialFetchRef.current && newUnreadCount > lastUnreadCountRef.current) {
                // Determine level of newest notification to play appropriate sound
                const newest = notificationsList[0];
                playSound(newest?.level || 'info');
            }

            lastUnreadCountRef.current = newUnreadCount;
            setNotifications(notificationsList);
            setUnreadCount(newUnreadCount);
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
        const { message, title, level = 'info', persistent = false, action_url, action } = options;
        const id = Math.random().toString(36).substring(2, 9);

        const newNotification: AppNotification = {
            id,
            message,
            title,
            level,
            action_url,
            action,
            persistent: false, // This is current instance ephemeral representation
            created_at: new Date().toISOString(),
            created_human: 'الآن'
        };

        // Add to toasts (ephemeral)
        setActiveToasts(prev => [...prev, newNotification]);

        // Force play sound for manual notifications
        playSound(level);

        // Auto-remove toast after duration
        setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);

        // If persistent was requested, we assume backend already handled it or we trigger it?
        // Usually, persistent notifications are triggered by backend events.
        // But if the frontend wants to "store" something, it can hit an endpoint.
        // For this unified system, persistent usually means "show in the list".
        if (persistent) {
            fetchNotifications(); // Refresh list to see the new one
        }
    }, [fetchNotifications]);

    // Convenience methods
    const showSuccess = useCallback((message: string) => notify({ message, level: 'success' }), [notify]);
    const showError = useCallback((message: string) => notify({ message, level: 'error' }), [notify]);
    const showInfo = useCallback((message: string) => notify({ message, level: 'info' }), [notify]);

    const markAsRead = async (id: string | number) => {
        try {
            const isAdmin = window.location.pathname.startsWith('/admin');
            const prefix = isAdmin ? '/admin' : '/app';
            await api.post(`${prefix}/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            logger.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const isAdmin = window.location.pathname.startsWith('/admin');
            const prefix = isAdmin ? '/admin' : '/app';
            await api.post(`${prefix}/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            logger.error('Failed to mark all as read', error);
        }
    };

    const deleteNotification = async (id: string | number) => {
        try {
            const isAdmin = window.location.pathname.startsWith('/admin');
            const prefix = isAdmin ? '/admin' : '/app';
            await api.delete(`${prefix}/notifications/${id}`);

            // Success path
            setNotifications(prev => prev.filter(n => n.id !== id));

            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error: any) {
            // If 404, it means it's already gone from server (ghost notification)
            // So we should remove it from UI as well
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
    };

    const showConfirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({ options, resolve });
        });
    }, []);

    // Listen for global custom events (e.g. from api.ts or other non-react files)
    useEffect(() => {
        const handleGlobalToast = (e: any) => {
            const { message, level, type } = e.detail;
            notify({ message, level: level || type || 'info' });
        };

        window.addEventListener('app:toast', handleGlobalToast as any);
        return () => window.removeEventListener('app:toast', handleGlobalToast as any);
    }, [notify]);

    // Fetch notifications on mount if user is logged in
    useEffect(() => {
        const isAuthPage = window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register') ||
            window.location.pathname === '/' ||
            window.location.pathname === '';

        if (!isAuthPage) {
            fetchNotifications();
            // Polling for new notifications every 20 seconds (improved for better responsiveness)
            const interval = setInterval(() => {
                fetchNotifications();
            }, 20000);
            return () => clearInterval(interval);
        }
    }, [fetchNotifications, window.location.pathname]);

    const contextValue = useMemo(() => ({
        notifications,
        activeToasts,
        unreadCount,
        loading,
        notify,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        showConfirm,
        showSuccess,
        showError,
        showInfo
    }), [
        notifications,
        activeToasts,
        unreadCount,
        loading,
        notify,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        showConfirm,
        showSuccess,
        showError,
        showInfo
    ]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            {/* Toasts Rendering - MOVED TO DASHBOARD LAYOUT FOOTER */}
            {/* <div className="fixed bottom-0 right-0 z-[9999] flex flex-col gap-2 p-4 pointer-events-none">
                {activeToasts.map(toast => (
                    <ToastComponent
                        key={toast.id}
                        notification={toast}
                        onClose={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div> */}

            {/* Confirmation Modal Placeholder */}
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

// Internal sub-components (can be moved to separate files later)
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastComponent: React.FC<{ notification: AppNotification, onClose: () => void }> = ({ notification, onClose }) => {
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
        <div className={`
            w-[320px] pointer-events-auto animate-in slide-in-from-right-full duration-500
            rounded-2xl border p-4 shadow-xl backdrop-blur-md flex gap-3
            ${bgColors[level]}
        `}>
            <div className="shrink-0">{icons[level]}</div>
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
            <button onClick={onClose} className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors h-fit">
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

// Portal/Modal shim
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
