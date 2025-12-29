import { Clock, CheckCircle, XCircle, AlertTriangle, Ban } from 'lucide-react';

interface TenantStatusBadgeProps {
    status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled';
    trialExpiresAt?: string;
}

export function TenantStatusBadge({ status, trialExpiresAt }: TenantStatusBadgeProps) {
    const getDaysRemaining = () => {
        if (!trialExpiresAt) return 0;
        const expirationDate = new Date(trialExpiresAt);
        const now = new Date();
        const diffTime = expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const getDayLabel = (days: number) => {
        if (days === 1) return 'يوم واحد';
        if (days === 2) return 'يومان';
        if (days >= 3 && days <= 10) return `${days} أيام`;
        return `${days} يوماً`;
    };

    const daysRemaining = status === 'trial' ? getDaysRemaining() : 0;

    const configs = {
        pending: {
            icon: AlertTriangle,
            label: 'قيد الانتظار',
            className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
        },
        trial: {
            icon: Clock,
            label: `تجربة (${getDayLabel(daysRemaining)})`,
            className: daysRemaining <= 3
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        },
        active: {
            icon: CheckCircle,
            label: 'مفعّل',
            className: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
        },
        expired: {
            icon: AlertTriangle,
            label: 'تجربة منتهية (معلق)',
            className: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        },
        disabled: {
            icon: Ban,
            label: 'معطّل',
            className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
        }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${config.className}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
        </div>
    );
}
