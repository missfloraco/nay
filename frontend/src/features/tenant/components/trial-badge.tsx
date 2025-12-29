import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { Clock, Zap } from 'lucide-react';

export function TrialBadge() {
    const { isTrialActive, daysRemaining } = useTrialStatus();

    if (!isTrialActive) return null;

    const isUrgent = daysRemaining <= 3;

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isUrgent
            ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
            {isUrgent ? (
                <Zap className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
            ) : (
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            <span className={`text-xs font-black ${isUrgent
                ? 'text-red-700 dark:text-red-300'
                : 'text-amber-700 dark:text-amber-300'
                }`}>
                {daysRemaining === 0 ? 'ينتهي اليوم!' : `${daysRemaining} ${daysRemaining === 1 ? 'يوم' : 'أيام'} متبقية`}
            </span>
        </div>
    );
}
