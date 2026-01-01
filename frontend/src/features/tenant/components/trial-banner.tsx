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
        <div className={`w-full h-[61px] shrink-0 ${theme.bg} text-white px-6 flex items-center justify-between gap-4 overflow-hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative group`}>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-700" />
            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-500" />

            <div className="flex items-center gap-4 relative z-10 overflow-hidden">
                {/* Icon Section */}
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    {theme.icon}
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                            {theme.label}
                        </span>
                        {!isTrialExpired && <Sparkles className="w-3 h-3 text-white/50" />}
                    </div>
                    <p className="text-[13px] font-black leading-tight truncate max-w-[600px]">
                        {theme.message}
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/app/plans')}
                className={`relative z-10 shrink-0 h-10 px-6 ${theme.btn} rounded-xl text-xs font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl`}
            >
                <span>الاشتراك الآن</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

