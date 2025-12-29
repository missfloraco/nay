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
import { Clock, AlertCircle } from 'lucide-react';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { formatDate } from '@/shared/utils/helpers';

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const { isTrialActive, daysRemaining, trialExpiresAt, isActive } = useTrialStatus();

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

            {/* Trial Alert - Following the Standard 250x90 Toast Model */}
            {isTrialActive && !isActive && (
                <div
                    onClick={() => window.location.href = '/app/support/messages'}
                    className="fixed bottom-0 left-0 w-[250px] h-[90px] bg-red-600 z-[100] flex items-center gap-4 px-6 shadow-2xl text-white animate-in fade-in slide-in-from-left-full duration-500 border-r border-white/20 cursor-pointer group"
                >
                    <div className="bg-white/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform animate-pulse">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col flex-1 gap-0.5 overflow-hidden">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 whitespace-nowrap">فترة تجريبية</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black leading-tight">{daysRemaining}</span>
                            <span className="text-[10px] font-black opacity-80">أيام متبقية</span>
                        </div>
                    </div>
                    <div className="shrink-0 opacity-40">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                </div>
            )}

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
