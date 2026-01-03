import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { ShieldCheck, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

export const TopStatusToolbar: React.FC = () => {
    const navigate = useNavigate();
    const { isActive } = useTrialStatus(); // We only care about active or bonus here
    const { tenant } = useTenantAuth();

    if (!tenant) return null;

    // 1. Active State
    if (isActive) {
        return (
            <div className="w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] -mx-4 lg:-mx-8 min-h-[70px] lg:h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between bg-emerald-600 dark:bg-emerald-600 px-4 lg:px-8 py-3 lg:py-0 gap-3 lg:gap-4">
                <div className="flex flex-col items-center lg:items-start lg:flex-1 min-w-0">
                    <div className="min-w-0 text-center lg:text-right">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            <h4 className="text-sm sm:text-base font-black text-white truncate">مبروك! اشتراكك نشط بالكامل</h4>
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-50/90 flex items-center justify-center lg:justify-start gap-2 truncate">
                            <Calendar className="w-3 h-3" />
                            <span className="truncate">نهاية الاشتراك: {tenant.subscription_ends_at ? formatDate(tenant.subscription_ends_at) : '—'}</span>
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-3">
                    <Button
                        onClick={() => navigate('/app/billing')}
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto px-6 justify-center"
                    >
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline">إدارة الاشتراك</span>
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </span>
                    </Button>
                </div>
            </div>
        );
    }

    // 2. Bonus Eligible State
    const isBonusEligible = !isActive && !tenant.trial_bonus_applied;

    if (isBonusEligible) {
        return (
            <div className="w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] -mx-4 lg:-mx-8 min-h-[70px] lg:h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between bg-indigo-600 dark:bg-indigo-600 px-4 lg:px-8 py-3 lg:py-0 gap-3 lg:gap-4">
                <div className="flex flex-col items-center lg:items-start lg:flex-1 min-w-0">
                    <div className="min-w-0 text-center lg:text-right">
                        <h4 className="text-sm sm:text-base font-black text-white">مكافأة حصرية بانتظارك!</h4>
                        <p className="text-[10px] sm:text-xs font-bold text-indigo-50/90 hidden sm:block">
                            أكمل إعدادات ملفك الشخصي واحصل على أيام إضافية مجاناً.
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-indigo-50/90 sm:hidden">
                            أكمل الملف واحصل على أيام مجاناً.
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-3">
                    <Button
                        onClick={() => navigate('/app/settings')}
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto px-6 justify-center"
                    >
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline">أكمل الآن</span>
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </span>
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};
