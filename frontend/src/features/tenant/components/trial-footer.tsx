import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { AlertTriangle, Zap, Clock } from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

export const TrialFooter: React.FC = () => {
    const { tenant } = useTenantAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    if (!tenant || tenant.status !== 'trial') return null;

    const daysRemaining = tenant.trial_expires_at
        ? Math.ceil((new Date(tenant.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalTrialDays = settings.trial_period_days || React.useMemo(() => {
        if (!tenant.trial_expires_at || !tenant.created_at) return 7;
        const start = new Date(tenant.created_at);
        const end = new Date(tenant.trial_expires_at);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, [tenant.trial_expires_at, tenant.created_at]);

    const isUrgent = daysRemaining <= 3;

    const formatDays = (num: number) => {
        if (num === 1) return 'يوم واحد';
        if (num === 2) return 'يومين';
        if (num >= 3 && num <= 10) return `${num} أيام`;
        return `${num} يوم`;
    };

    return (
        <div
            className="w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] -mx-6 lg:-mx-12 h-full flex flex-row items-center justify-between ps-6 lg:ps-12 pe-6 lg:pe-12 py-0 gap-3 lg:gap-4 overflow-hidden relative group"
            style={{
                background: `linear-gradient(135deg, ${settings.accentColor2 || '#fb005e'} 0%, #dc2626 50%, #991b1b 100%)`
            }}
        >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out" />

            <div className="flex flex-col items-start flex-1 min-w-0 relative z-10 py-1">
                <div className="min-w-0 text-right">
                    <h4 className="text-[10px] sm:text-base font-black text-white truncate drop-shadow-sm leading-tight">
                        {isUrgent ? 'انتبه! فترتك التجريبية توشك على الانتهاء' : 'أنت تستخدم النسخة التجريبية'}
                    </h4>
                    <p className="text-[8px] sm:text-xs font-bold truncate text-white/80 drop-shadow-sm leading-tight">
                        {daysRemaining > 0
                            ? `متبقي ${formatDays(daysRemaining)} لانتهاء التجربة.`
                            : 'انتهت الفترة التجريبية. يرجى الترقية للاستمرار.'}
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
                        <span className="sm:hidden !text-white">ترقية</span>
                        <span className="hidden sm:inline !text-white">ترقية الآن</span>
                    </span>
                </Button>
            </div>
        </div>
    );
};
