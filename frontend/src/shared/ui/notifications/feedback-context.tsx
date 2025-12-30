import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

import { ConfirmationVariant } from '@/shared/ui/modals/confirmation-modal';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    variant?: ConfirmationVariant;
}

export interface FeedbackContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
    // compatibility alias for useToast
    showToast: (message: string, type: any) => void;
}

export const FeedbackContext = createContext<FeedbackContextType | null>(null);

import Notification from '@/shared/ui/notifications/notif-base';
import ConfirmationModal from '@/shared/ui/modals/confirmation-modal';
import { Clock, AlertCircle, Crown, Zap } from 'lucide-react';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { formatDate } from '@/shared/utils/helpers';

import { useTenantAuth } from '@/features/auth/tenant-auth-context';

export const TrialAlert = () => {
    const { isTrialActive, daysRemaining, isActive, subDaysRemaining } = useTrialStatus();
    const { user } = useTenantAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const shouldShow = isTrialActive || (isActive && subDaysRemaining > 0);

        if (!shouldShow) {
            setIsVisible(false);
            return;
        }

        // If user is new (created within the last 2 minutes), wait 20 seconds
        const accountAge = user?.created_at ? (new Date().getTime() - new Date(user.created_at).getTime()) : 0;
        const IS_NEW_ACCOUNT = accountAge < 120000; // 2 minutes

        if (IS_NEW_ACCOUNT) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 20000); // 20 seconds
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [isTrialActive, isActive, subDaysRemaining, user?.created_at]);

    if (!isVisible) return null;

    const isSubscription = isActive && !isTrialActive;
    const days = isSubscription ? subDaysRemaining : daysRemaining;
    const label = isSubscription ? 'اشتراك نشط' : 'فترة تجريبية';
    const Icon = isSubscription ? Crown : Zap;

    // Theme colors
    const bgColor = isSubscription ? 'bg-emerald-600' : 'bg-red-600';
    const accentColor = isSubscription ? 'bg-emerald-500' : 'bg-red-500';

    return (
        <div
            onClick={() => window.location.href = '/app/support/messages'}
            className="fixed bottom-0 left-0 z-[100] w-[250px] h-[90px] animate-in fade-in slide-in-from-left-full duration-700 cursor-pointer group"
        >
            <div className={`relative w-full h-full flex items-center gap-4 px-6 ${bgColor} shadow-2xl overflow-hidden`}>
                {/* Decorative Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r from-${isSubscription ? 'emerald' : 'red'}-500 to-${isSubscription ? 'emerald' : 'red'}-600`} />

                {/* Icon Container */}
                <div className="relative shrink-0 bg-white/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="relative flex flex-col flex-1 gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 leading-none">
                        {label}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white tabular-nums leading-none">
                            {days}
                        </span>
                        <span className="text-[11px] font-black text-white/80">أيـام متبقية</span>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="relative shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                    <AlertCircle className="w-5 h-5 text-white" />
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
            </div>
        </div>
    );
};

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const showSuccess = useCallback((message: string) => {
        setNotification({ message, type: 'success' });
    }, []);

    const showError = useCallback((message: string) => {
        setNotification({ message, type: 'error' });
    }, []);

    // Listen for global custom events (e.g. from api.ts or other non-react files)
    useEffect(() => {
        const handleGlobalToast = (e: any) => {
            const { message, type } = e.detail;
            if (type === 'error') showError(message);
            else showSuccess(message);
        };

        window.addEventListener('app:toast', handleGlobalToast);
        return () => window.removeEventListener('app:toast', handleGlobalToast);
    }, [showError, showSuccess]);

    const showInfo = useCallback((message: string) => {
        setNotification({ message, type: 'success' }); // Info uses success color for now
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({ options, resolve });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState) {
            confirmState.resolve(true);
            setConfirmState(null);
        }
    };

    const handleCancel = () => {
        if (confirmState) {
            confirmState.resolve(false);
            setConfirmState(null);
        }
    };

    return (
        <FeedbackContext.Provider value={{ showSuccess, showError, showInfo, showConfirm, showToast: (msg, type) => type === 'error' ? showError(msg) : showSuccess(msg) }}>
            {children}

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {confirmState && (
                <ConfirmationModal
                    isOpen={true}
                    title={confirmState.options.title}
                    message={confirmState.options.message}
                    confirmLabel={confirmState.options.confirmLabel}
                    cancelLabel={confirmState.options.cancelLabel}
                    variant={confirmState.options.variant || (confirmState.options.isDestructive ? 'danger' : 'warning')}
                    onConfirm={handleConfirm}
                    onClose={handleCancel}
                />
            )}

        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
    return context;
};

// Also export useToast for backward compatibility
export const useToast = () => {
    const context = useContext(FeedbackContext);
    if (!context) throw new Error('useToast must be used within FeedbackProvider');
    return {
        showToast: (message: string, type: ToastType) => {
            if (type === 'success') context.showSuccess(message);
            else if (type === 'error') context.showError(message);
            else context.showInfo(message);
        }
    };
};
