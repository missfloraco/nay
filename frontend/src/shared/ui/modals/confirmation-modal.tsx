import React from 'react';
import Modal from '@/shared/ui/modals/modal';
import Button from '@/shared/ui/buttons/btn-base';
import { AlertTriangle, CheckCircle, Info, Trash2, XCircle } from 'lucide-react';
import { useAction } from '@/shared/contexts/action-context';
import { useEffect } from 'react';

export type ConfirmationVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isConfirming?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmationVariant;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isConfirming = false,
    confirmLabel,
    cancelLabel = "إلغاء",
    variant = 'danger'
}) => {
    // Define variant-specific styles and icons
    const variants = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-500',
            borderColor: 'border-red-100 dark:border-red-900/30',
            confirmButtonVariant: 'danger' as const,
            defaultLabel: 'نعم، احذف',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-500',
            borderColor: 'border-amber-100 dark:border-amber-900/30',
            confirmButtonVariant: 'primary' as const, // or a specific warning button if available
            defaultLabel: 'تأكيد',
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconColor: 'text-emerald-500',
            borderColor: 'border-emerald-100 dark:border-emerald-900/30',
            confirmButtonVariant: 'success' as const,
            defaultLabel: 'حسناً',
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-500',
            borderColor: 'border-blue-100 dark:border-blue-900/30',
            confirmButtonVariant: 'primary' as const,
            defaultLabel: 'موافق',
        }
    };

    const currentVariant = variants[variant];
    const Icon = currentVariant.icon;
    const finalConfirmLabel = confirmLabel || currentVariant.defaultLabel;

    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (isOpen) {
            setPrimaryAction({
                label: finalConfirmLabel,
                icon: Icon,
                variant: variant === 'danger' ? 'danger' : 'primary',
                loading: isConfirming,
                onClick: onConfirm,
                secondaryAction: {
                    label: cancelLabel,
                    onClick: onClose
                }
            });
        }
        return () => setPrimaryAction(null);
    }, [isOpen, finalConfirmLabel, Icon, variant, isConfirming, onConfirm, cancelLabel, onClose, setPrimaryAction]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            variant="content-fit"
            title={title}
        >
            <div className="flex flex-col items-center text-center gap-8">
                {/* Dynamic Icon with Ripple Effect */}
                <div className={`
                    relative w-24 h-24 rounded-[2.5rem] 
                    flex items-center justify-center 
                    ${currentVariant.iconBg} 
                    ${currentVariant.borderColor} 
                    border-[3px]
                    shadow-xl
                `}>
                    <div className={`absolute inset-0 rounded-[2.5rem] ${currentVariant.iconBg} animate-ping opacity-20`} />
                    <Icon className={`w-10 h-10 ${currentVariant.iconColor} relative z-10 stroke-[2.5px]`} />
                </div>

                {/* Text Content */}
                <div className="space-y-3 w-full">
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-relaxed max-w-[85%] mx-auto">
                        {message}
                    </p>
                </div>

                {/* Actions removed - Moved to global footer toolbar */}
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
