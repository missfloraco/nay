import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { Clock, Zap } from 'lucide-react';

export function TrialBadge() {
    const { isTrialActive, daysRemaining } = useTrialStatus();

    if (!isTrialActive) return null;

    const isUrgent = daysRemaining <= 3;

    return (
        <div className="fixed bottom-0 right-0 z-[50] w-[250px] h-[90px] pointer-events-none">
            <div className={`
                relative w-full h-full flex items-center gap-4 px-6 pointer-events-auto
                ${isUrgent ? 'bg-red-600' : 'bg-amber-500'}
                border-t border-l border-white/10
            `}>
                {/* Icon */}
                <div className="shrink-0 p-2 rounded-xl bg-white/20 text-white">
                    {isUrgent ? (
                        <Zap className="w-5 h-5 animate-pulse" />
                    ) : (
                        <Clock className="w-5 h-5" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-white">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/80 truncate mb-0.5">
                        {isUrgent ? 'اشتراكك ينتهي قريباً' : 'الفترة التجريبية'}
                    </p>
                    <p className="text-[12px] font-black leading-tight">
                        {daysRemaining === 0 ? 'ينتهي الاشتراك اليوم!' : `${daysRemaining} ${daysRemaining === 1 ? 'يوم' : 'أيام'} متبقية`}
                    </p>
                </div>
            </div>
        </div>
    );
}
