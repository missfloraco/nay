import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

export const SubscriptionExpiryFooter: React.FC = () => {
    const { tenant } = useTenantAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    if (!tenant || tenant.status !== 'active' || !tenant.subscription_ends_at) return null;

    const expirationDate = new Date(tenant.subscription_ends_at);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Show only if within 30 days (and not expired)
    if (diffDays > 30 || diffDays < 0) return null;

    const formatDays = (num: number) => {
        if (num === 0) return 'اليوم';
        if (num === 1) return 'يوم واحد';
        if (num === 2) return 'يومين';
        if (num >= 3 && num <= 10) return `${num} أيام`;
        return `${num} يوماً`;
    };

    return (
        <div
            className="w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] -mx-6 lg:-mx-12 h-full flex flex-row items-center justify-between ps-6 lg:ps-12 pe-6 lg:pe-12 py-0 gap-3 lg:gap-4 overflow-hidden relative group"
            style={{
                background: `linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)`
            }}
        >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] ease-in-out" />

            <div className="flex flex-col items-start flex-1 min-w-0 relative z-10 py-1">
                <div className="min-w-0 text-right">
                    <h4 className="text-[10px] sm:text-base font-black text-white truncate drop-shadow-sm leading-tight flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 sm:w-5 sm:h-5 text-white animate-pulse" />
                        تنبيه: اشتراكك ينتهي قريباً
                    </h4>
                    <p className="text-[8px] sm:text-xs font-bold truncate text-white/90 drop-shadow-sm leading-tight mt-0.5">
                        متبقي {formatDays(diffDays)} على انتهاء صلاحية حسابك. يرجى التجديد لتجنب التوقف.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end shrink-0 relative z-10">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/app/billing')}
                    className="bg-white/10 !text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg transform hover:translate-y-[-2px] transition-all w-auto h-8 lg:h-10 px-3 sm:px-8 justify-center font-black text-[10px] sm:text-sm"
                >
                    <span className="flex items-center gap-2">
                        <span className="sm:hidden !text-white">تجديد</span>
                        <span className="hidden sm:inline !text-white">تجديد الاشتراك الآن</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                    </span>
                </Button>
            </div>
        </div>
    );
};
