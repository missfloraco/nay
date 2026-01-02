import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { Clock, Zap, ArrowRight, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';

export default function TrialBanner() {
    const navigate = useNavigate();
    const { isTrialActive, daysRemaining, isTrialExpired, isActive } = useTrialStatus();
    const { tenant } = useTenantAuth();

    if (!tenant) return null;

    // 1. Bonus Eligible State
    const isBonusEligible = !isActive && !tenant.trial_bonus_applied;

    // Status-specific themes
    let theme;

    if (isActive) {
        theme = {
            bg: 'bg-emerald-600',
            icon: <ShieldCheck className="w-5 h-5 animate-pulse" />,
            label: 'حساب مفعل',
            message: 'اشتراكك نشط بالكامل ومؤمن. شكراً لثقتك بنا وبخدماتنا.',
            btn: 'bg-white text-emerald-600',
            btnLabel: 'إدارة الباقة'
        };
    } else if (isTrialExpired) {
        theme = {
            bg: 'bg-red-600',
            icon: <Zap className="w-5 h-5 animate-pulse" />,
            label: 'انتهت الفترة التجريبية',
            message: 'لقد انتهت فترة تجربتك المجانية. اشترك الآن لمتابعة استخدام المميزات الرائعة.',
            btn: 'bg-white text-red-600',
            btnLabel: 'الاشتراك الآن'
        };
    } else if (isBonusEligible) {
        theme = {
            bg: 'bg-indigo-600',
            icon: <Sparkles className="w-5 h-5 animate-pulse" />,
            label: 'مكافأة حصرية بانتظارك',
            message: 'أكمل إعدادات ملفك الشخصي (الصورة ورقم الواتساب) واحصل على 7 أيام إضافية مجاناً!',
            btn: 'bg-white text-indigo-600',
            btnLabel: 'أكمل الملف الآن',
            path: '/app/settings'
        };
    } else {
        const isUrgent = daysRemaining <= 3;
        theme = {
            bg: isUrgent ? 'bg-amber-600' : 'bg-primary',
            icon: isUrgent ? <Zap className="w-5 h-5 animate-pulse" /> : <Clock className="w-5 h-5" />,
            label: isUrgent ? 'اشتراكك ينتهي قريباً' : 'الفترة التجريبية',
            message: isUrgent
                ? `متبقي ${daysRemaining === 0 ? 'أقل من يوم' : `${daysRemaining} أيام`} فقط. سارع بتجديد اشتراكك لضمان استمرار الخدمة.`
                : `أنت الآن في الفترة التجريبية (${daysRemaining} أيام متبقية). اشترك الآن للحصول على مميزات غير محدودة.`,
            btn: 'bg-white text-primary',
            btnLabel: 'الاشتراك الآن'
        };
    }

    const effectivePath = theme.path || '/app/plans';

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
                    onClick={() => navigate(effectivePath)}
                    className={`w-full h-11 flex items-center justify-center gap-2 ${theme.btn} rounded-xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all shadow-md`}
                >
                    <span>{theme.btnLabel}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
            </div>
        </div>
    );
}

