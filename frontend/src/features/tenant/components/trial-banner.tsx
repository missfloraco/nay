import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { Clock, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function TrialBanner() {
    const navigate = useNavigate();
    const { isTrialActive, daysRemaining, isTrialExpired } = useTrialStatus();

    // Forced display for development/design verification (Demo Mode)
    // To restore strict behavior later, uncomment the line below:
    // if (!isTrialActive && !isTrialExpired) return null;

    // Use actual days if available, otherwise fallback to 7 for demo
    const effectiveDays = (isTrialActive || isTrialExpired) ? daysRemaining : 7;
    const isUrgent = isTrialActive && effectiveDays <= 3;

    // Status-specific themes
    const theme = isTrialExpired
        ? {
            bg: 'bg-red-600',
            icon: <Zap className="w-5 h-5 animate-pulse" />,
            label: 'انتهت الفترة التجريبية',
            message: 'لقد انتهت فترة تجربتك المجانية. اشترك الآن لمتابعة استخدام المميزات الرائعة.',
            btn: 'bg-white text-red-600'
        }
        : isUrgent
            ? {
                bg: 'bg-amber-600',
                icon: <Zap className="w-5 h-5 animate-pulse" />,
                label: 'اشتراكك ينتهي قريباً',
                message: `متبقي ${daysRemaining === 0 ? 'أقل من يوم' : `${daysRemaining} أيام`} فقط. سارع بتجديد اشتراكك لضمان استمرار الخدمة.`,
                btn: 'bg-white text-amber-600'
            }
            : {
                bg: 'bg-primary',
                icon: <Clock className="w-5 h-5" />,
                label: 'الفترة التجريبية',
                message: `أنت الآن في الفترة التجريبية (${effectiveDays} أيام متبقية). أكمل بياناتك واحصل على 7 أيام إضافية!`,
                btn: 'bg-white text-primary'
            };

    return (
        <div className={`w-full overflow-hidden rounded-2xl ${theme.bg} text-white p-4 relative group shadow-lg shadow-emerald-500/10`}>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-full bg-white/10 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-700" />

            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shrink-0">
                        {React.cloneElement(theme.icon as React.ReactElement, { className: 'w-4 h-4 text-white' })}
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block leading-none mb-1">
                            {theme.label}
                        </span>
                        {!isTrialExpired && <Sparkles className="w-3 h-3 text-white/50 absolute top-0 left-0" />}
                    </div>
                </div>

                <p className="text-[11px] font-bold leading-relaxed opacity-90">
                    {theme.message}
                </p>

                <button
                    onClick={() => navigate('/app/plans')}
                    className={`w-full h-9 flex items-center justify-center gap-2 ${theme.btn} rounded-xl text-[10px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-md`}
                >
                    <span>الاشتراك الآن</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

