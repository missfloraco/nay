import React, { ReactNode } from 'react';
import { LayoutDashboard, Users, Crown, Layout, CreditCard, Settings, Trash2, Headset } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useText } from '@/shared/contexts/text-context';
import { useAction } from '@/shared/contexts/action-context';
import { DashboardLayout } from '@/shared/layout/dashboard-layout';
import api from '@/shared/services/api';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
    toolbar?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noPadding = false, toolbar }) => {
    const { user, loading } = useAdminAuth();
    const { t } = useText();
    const { primaryAction, extraActions } = useAction();

    const { data: trashData } = useQuery({
        queryKey: ['admin-trash-count'],
        queryFn: () => api.get('/admin/trash'),
        refetchInterval: 10000,
        enabled: !!user
    });

    const trashCount = (trashData as any)?.stats?.total || 0;

    const navItems = React.useMemo(() => [
        { icon: LayoutDashboard, label: t('admin.NAV.DASHBOARD', 'لوحة التحكم'), path: '/admin/dashboard', color: 'text-blue-600' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]' },
        { icon: Crown, label: t('admin.NAV.PLANS', 'الخطط السعرية'), path: '/admin/plans', color: 'text-orange-500' },

        { icon: Layout, label: t('admin.NAV.IDENTITY', 'هوية المنصة'), path: '/admin/identity', color: 'text-indigo-600' },
        { icon: CreditCard, label: t('admin.NAV.PAYMENTS', 'طرق الدفع'), path: '/admin/payment-methods', color: 'text-emerald-500' },
        { icon: Headset, label: t('admin.NAV.SUPPORT', 'الدعم الفني'), path: '/admin/support', color: 'text-rose-500' },
    ], [t]);

    const secondaryItems = React.useMemo(() => [
        { icon: Settings, label: t('admin.NAV.SETTINGS', 'الإعدادات العامة'), path: '/admin/settings', color: 'text-gray-600' },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-600 font-black', badge: trashCount },
    ], [t, trashCount]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout
            title={title}
            homePath="/admin"
            items={navItems}
            secondaryItems={secondaryItems}
            noPadding={noPadding}
            toolbar={toolbar}
            primaryAction={primaryAction}
            extraActions={extraActions}
        >
            {children}
        </DashboardLayout>
    );
};

export default AdminLayout;
