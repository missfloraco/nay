import React from 'react';
import { useNotifications } from '@/shared/contexts/notification-context';

export type { ToastType, AppNotification as Toast, ConfirmOptions } from '@/shared/contexts/notification-context';

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // This provider is now just a pass-through because NotificationProvider is at the root in index.tsx
    return <>{children}</>;
};

export const useFeedback = () => {
    const { showSuccess, showError, showInfo, showConfirm } = useNotifications();
    return { showSuccess, showError, showInfo, showConfirm };
};

export const useToast = () => {
    const { notify } = useNotifications();
    return {
        showToast: (message: string, type: 'success' | 'error' | 'info') => {
            notify({ message, level: type });
        }
    };
};

export { TrialAlert } from './feedback-context-trial-alert';
