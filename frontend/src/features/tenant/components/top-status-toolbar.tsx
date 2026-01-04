import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { ShieldCheck, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';
import { useSettings } from '@/shared/contexts/app-context';

import { DefaultToolbar } from '@/shared/layout/toolbar/default-toolbar';

interface TopStatusToolbarProps {
    user: any;
}

export const TopStatusToolbar: React.FC<TopStatusToolbarProps> = ({ user }) => {
    const navigate = useNavigate();
    const { isActive } = useTrialStatus(); // We only care about active or bonus here
    const { tenant } = useTenantAuth();
    const { settings } = useSettings();
    const [isPersistentActiveVisible, setIsPersistentActiveVisible] = React.useState(true);

    // Persistent Timer for "Active" Banner
    React.useEffect(() => {
        if (!isActive || !tenant?.uid) return;

        const storageKey = `active_banner_start_${tenant.uid}`;
        const discoveryTime = localStorage.getItem(storageKey);

        let startTime: number;
        if (!discoveryTime) {
            startTime = Date.now();
            localStorage.setItem(storageKey, startTime.toString());
        } else {
            startTime = parseInt(discoveryTime);
        }

        const checkVisibility = () => {
            const now = Date.now();
            const elapsedSeconds = (now - startTime) / 1000;
            if (elapsedSeconds >= 180) { // 3 minutes
                setIsPersistentActiveVisible(false);
            } else {
                setIsPersistentActiveVisible(true);
            }
        };

        checkVisibility();
        const interval = setInterval(checkVisibility, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isActive, tenant?.uid]);

    if (!tenant) return null;

    // 1. Active State
    if (isActive && isPersistentActiveVisible) {
        return (
            <div
                className="w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] -mx-6 lg:-mx-12 h-full flex flex-row items-center justify-between ps-6 lg:ps-12 pe-6 lg:pe-12 py-0 gap-3 lg:gap-4 overflow-hidden relative group"
                style={{
                    background: `linear-gradient(135deg, ${settings.accentColor1 || '#02aa94'} 0%, #059669 60%, #065f46 100%)`
                }}
            >
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] ease-in-out" />

                <div className="flex flex-col items-start flex-1 min-w-0 relative z-10 py-1">
                    <div className="min-w-0 text-right text-white">
                        <div className="flex items-center justify-start gap-2 leading-tight">
                            <h4 className="text-[10px] sm:text-base font-black truncate drop-shadow-sm">مبروك! اشتراكك نشط بالكامل</h4>
                        </div>
                        <p className="text-[8px] sm:text-xs font-bold text-white/80 flex items-center justify-start gap-2 truncate drop-shadow-sm leading-tight mt-0.5">
                            <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span className="truncate text-white/90">نهاية الاشتراك: {tenant.subscription_ends_at ? formatDate(tenant.subscription_ends_at) : '—'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end shrink-0 relative z-10">
                    <Button
                        onClick={() => navigate('/app/billing')}
                        variant="secondary"
                        className="bg-white/10 !text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto h-8 lg:h-10 px-3 sm:px-6 justify-center text-[10px] sm:text-sm font-black"
                    >
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline !text-white">إدارة الاشتراك</span>
                            <span className="sm:hidden font-bold !text-white">إدارة</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
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
            <div
                className="w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] -mx-6 lg:-mx-12 h-full flex flex-row items-center justify-between ps-6 lg:ps-12 pe-6 lg:pe-12 py-0 gap-3 lg:gap-4 overflow-hidden relative group"
                style={{
                    background: `linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)`
                }}
            >
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] ease-in-out" />

                <div className="flex flex-col items-start flex-1 min-w-0 relative z-10 py-1">
                    <div className="min-w-0 text-right text-white">
                        <h4 className="text-[10px] sm:text-base font-black truncate drop-shadow-sm leading-tight">مكافأة حصرية بانتظارك!</h4>
                        <p className="text-[8px] sm:text-xs font-bold text-white/80 drop-shadow-sm leading-tight">
                            أكمل الملف واحصل على أيام مجاناً.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end shrink-0 relative z-10">
                    <Button
                        onClick={() => navigate('/app/settings')}
                        variant="secondary"
                        className="bg-white/10 !text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto h-8 lg:h-10 px-3 sm:px-6 justify-center text-[10px] sm:text-sm font-black"
                    >
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline !text-white uppercase">أكمل الإعدادات</span>
                            <span className="sm:hidden font-bold !text-white">أكمل الآن</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                        </span>
                    </Button>
                </div>
            </div>
        );
    }

    return <DefaultToolbar user={user} />;
};
