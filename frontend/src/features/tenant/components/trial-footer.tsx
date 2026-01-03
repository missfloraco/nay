import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { AlertTriangle, Zap, Clock } from 'lucide-react';
import { formatDate } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

export const TrialFooter: React.FC = () => {
    const { tenant } = useTenantAuth();
    const navigate = useNavigate();

    if (!tenant || tenant.status !== 'trial') return null;

    const daysRemaining = tenant.trial_expires_at
        ? Math.ceil((new Date(tenant.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalTrialDays = React.useMemo(() => {
        if (!tenant.trial_expires_at || !tenant.created_at) return 0;
        const start = new Date(tenant.created_at);
        const end = new Date(tenant.trial_expires_at);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, [tenant.trial_expires_at, tenant.created_at]);

    const isUrgent = daysRemaining <= 3;

    return (
        <div className={`w-full min-h-[70px] lg:h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 lg:px-8 py-3 lg:py-0 gap-3 lg:gap-4 ${isUrgent ? 'bg-red-50 dark:bg-red-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
            <div className="flex flex-col items-center lg:items-start lg:flex-1 min-w-0">
                <div className="min-w-0 text-center lg:text-right">
                    <h4 className={`text-sm sm:text-base font-black ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                        {isUrgent ? 'انتبه! فترتك التجريبية توشك على الانتهاء' : `أنت تستخدم النسخة التجريبية (${totalTrialDays} يوم)`}
                    </h4>
                    <p className={`text-[10px] sm:text-xs font-bold truncate ${isUrgent ? 'text-red-600/70 dark:text-red-400/70' : 'text-orange-600/70 dark:text-orange-400/70'}`}>
                        {daysRemaining > 0
                            ? `متبقي ${daysRemaining} يوم لانتهاء التجربة. لا تفقد بياناتك عند التوقف.`
                            : 'انتهت الفترة التجريبية. يرجى الترقية للاستمرار.'}
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-3">
                <Button
                    variant={isUrgent ? 'danger' : 'primary'}
                    onClick={() => navigate('/app/billing')}
                    className="shadow-lg shadow-primary/20 transform hover:translate-y-[-2px] transition-all w-auto px-8 justify-center"
                >
                    <span className="flex items-center gap-2">
                        <span className="sm:hidden font-bold">ترقية</span>
                        <span className="hidden sm:inline">ترقية الآن</span>
                    </span>
                </Button>
            </div>
        </div>
    );
};
