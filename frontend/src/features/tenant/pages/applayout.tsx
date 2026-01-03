import React, { ReactNode } from 'react';
import { Layers, DollarSign, Settings, Trash2, Headset } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useText } from '@/shared/contexts/text-context';
import { useAction } from '@/shared/contexts/action-context';
import { DashboardLayout } from '@/shared/layout/dashboard-layout';
import { ImpersonationBanner } from '@/shared/components/impersonationbanner';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

import { useLocation } from 'react-router-dom';
import { TrialFooter } from '@/features/tenant/components/trial-footer';
import { TopStatusToolbar } from '@/features/tenant/components/top-status-toolbar';
import { SubscriptionExpiryFooter } from '@/features/tenant/components/subscription-expiry-footer';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
    toolbar?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, noPadding = false, toolbar }) => {
    const { user, tenant, isImpersonating, logout: logoutTenant } = useTenantAuth();
    const { t } = useText();
    const { primaryAction, extraActions } = useAction();
    const location = useLocation();

    const handleExitImpersonation = async () => {
        try {
            await logoutTenant(false);
            window.location.href = '/admin/tenants';
        } catch (e) {
            logger.error('Exit impersonation failed', e);
            window.location.href = '/admin/tenants';
        }
    };

    const { data: trashData } = useQuery({
        queryKey: ['trash-count'],
        queryFn: () => api.get('/app/trash'),
        refetchInterval: 10000,
        enabled: !!user
    });

    const trashCount = (trashData as any)?.stats?.total || 0;

    const menuItems = React.useMemo(() => [
        { icon: Layers, label: t('tenant.NAV.DASHBOARD', 'لوحة التحكم'), path: '/app/dashboard', color: 'text-blue-600' },
        { icon: DollarSign, label: t('tenant.NAV.BILLING', 'الاشتراكات والفوترة'), path: '/app/billing', color: 'text-emerald-600 font-bold' },
        { icon: Headset, label: t('tenant.NAV.SUPPORT', 'الدعم الفني'), path: '/app/support/messages', color: 'text-rose-500' },
    ], [t]);

    const secondaryItems = React.useMemo(() => [
        { icon: Trash2, label: t('tenant.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/app/trash', color: 'text-red-600 font-black', badge: trashCount },
    ], [t, trashCount]);

    const isDashboard = location.pathname === '/app' || location.pathname === '/app/dashboard';

    const showTrialFooter = isDashboard && tenant?.status === 'trial';

    const showExpiryFooter = React.useMemo(() => {
        if (!tenant || tenant.status !== 'active' || !tenant.subscription_ends_at) return false;
        const expirationDate = new Date(tenant.subscription_ends_at);
        const now = new Date();
        const diffDays = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        // Only show warning if within 30 days
        return diffDays >= 0 && diffDays <= 30;
    }, [tenant]);

    // logic: if page provides toolbar, use it. otherwise if dashboard, try to show TopStatusToolbar
    const effectiveToolbar = toolbar || (isDashboard ? <TopStatusToolbar /> : undefined);

    const footerElement = showTrialFooter ? <TrialFooter /> : (showExpiryFooter ? <SubscriptionExpiryFooter /> : undefined);

    return (
        <DashboardLayout
            title={title}
            homePath="/app"
            items={menuItems}
            secondaryItems={secondaryItems}
            noPadding={noPadding}
            toolbar={effectiveToolbar}
            primaryAction={primaryAction}
            extraActions={extraActions}
            banners={
                <ImpersonationBanner tenantName={tenant?.name || '...'} onExit={handleExitImpersonation} />
            }
            footerContent={footerElement}
        >
            {children}
        </DashboardLayout>
    );
};

export default AppLayout;
