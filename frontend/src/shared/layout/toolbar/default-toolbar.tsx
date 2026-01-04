import React from 'react';
import { Sparkles, Calendar, Layout, User } from 'lucide-react';
import { formatDate, resolveAssetUrl } from '@/shared/utils/helpers';
import { useLocation } from 'react-router-dom';
import { useText } from '@/shared/contexts/text-context';

interface DefaultToolbarProps {
    user: any;
}

export const DefaultToolbar: React.FC<DefaultToolbarProps> = ({ user }) => {
    const { t } = useText();
    const location = useLocation();

    // Check if it's a primary dashboard page
    const isAppDashboard = location.pathname === '/app' || location.pathname === '/app/dashboard';
    const isAdminDashboard = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    const isDashboard = isAppDashboard || isAdminDashboard;

    // Format today's date in a friendly way
    const todayString = formatDate(new Date().toISOString());

    if (isDashboard) {
        const avatarUrl = resolveAssetUrl(user?.avatar_url || (user as any)?.avatarUrl);

        return (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700 h-full">
                <div className="relative group/avatar">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-primary/20 p-1 transition-all duration-500 group-hover/avatar:border-primary">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-dark-900 rounded-full" />
                </div>

                <div className="flex flex-col justify-center">
                    <h2 className="text-base lg:text-xl font-black text-gray-900 dark:text-white leading-tight mb-0.5 tracking-tight flex flex-col">
                        <span className="text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-widest">{isAdminDashboard ? 'إدارة النظام والتحكم المركزي' : 'نظرة عامة على أداء التطبيق'}</span>
                        <span>مرحباً بك، <span className="text-primary">{user?.name}</span></span>
                    </h2>
                    <p className="text-[9px] lg:text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-primary/50" />
                        <span>نحن في {todayString}</span>
                    </p>
                </div>
            </div>
        );
    }

    // Default for other pages - Dynamic navigation context
    const pathParts = location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    // Simple mapping for common paths in Arabic
    const pathLabels: Record<string, string> = {
        'billing': 'الاشتراكات والفوترة',
        'support': 'الدعم الفني',
        'settings': 'الإعدادات',
        'tenants': 'إدارة المشتركين',
        'plans': 'الخطط السعرية',
        'identity': 'هوية المنصة',
        'trash': 'سلة المحذوفات',
        'messages': 'المراسلات تذاكر الدعم',
        'payment-methods': 'طرق الدفع'
    };

    const displayLabel = pathLabels[lastPart] || lastPart || 'الرئيسية';

    return (
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700 h-full">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100 dark:border-white/5">
                <Layout className="w-4 h-4" />
            </div>
            <div className="flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">تصفح المنصة</p>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">أنت في قسم {displayLabel}</h3>
            </div>
        </div>
    );
};
