import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Settings,
    Trash2,
    Plus,
    Loader2,
    MessageSquare,
    Sparkles,
    Layers,
    DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';

import { useAction } from '@/shared/contexts/action-context';
import { useText } from '@/shared/contexts/text-context';
import { Header } from '@/shared/layout/header/header';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import AdSlot from '@/shared/ads/adslot';
import { ImpersonationBanner } from '@/shared/components/impersonationbanner';
import TrialBanner from '@/features/tenant/components/trial-banner';
import ShieldOverlay from '@/shared/components/shield-overlay';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';
import { MainSidebar } from '@/shared/layout/sidebar/sidebar-main';
import { NameHeaderLeft } from '@/shared/layout/header/name-header-left';
import Button from '@/shared/ui/buttons/btn-base';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
    toolbar?: ReactNode; // New prop for local controls
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = '', icon, noPadding = false, actions, toolbar }) => {
    const { user, tenant, isImpersonating, logout: logoutTenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();
    const { t } = useText();
    const { primaryAction, extraActions } = useAction();
    const { isRightDrawerOpen, closeDrawers, toggleRightDrawer } = useUI();
    const isAdminSession = isImpersonating || !!adminUser;
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

    const menuItems = [
        { icon: Layers, label: t('tenant.NAV.DASHBOARD', 'لوحة التحكم'), path: '/app/dashboard', color: 'text-blue-600' },
        { icon: DollarSign, label: t('tenant.NAV.SUBSCRIPTIONS', 'باقات الاشتراك'), path: '/app/plans', color: 'text-emerald-600 font-bold' },
    ];

    const secondaryItems = [
        { icon: Settings, label: t('tenant.NAV.SETTINGS', 'الإعدادات العامة'), path: '/app/settings', color: 'text-gray-600' },
        { icon: Trash2, label: t('tenant.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/app/trash', color: 'text-red-600 font-black', badge: trashCount },
    ];

    return (
        <div className={`transition-colors duration-500 min-h-screen lg:h-screen w-full lg:overflow-hidden flex flex-col bg-white dark:bg-dark-950 ${isImpersonating ? 'pt-[0px]' : ''}`} dir="rtl">

            {/* ShieldOverlay moved to MainApp for global protection */}
            <ImpersonationBanner tenantName={tenant?.name || '...'} onExit={handleExitImpersonation} />

            {/* 1. Full Width Header */}
            <Header onMenuClick={toggleRightDrawer} className="global-header shrink-0" mobileOnlyBranding={false} title={title} actions={actions} icon={icon} />

            {/* 2. Middle Section (Sidebar + Content) */}
            <div className="flex-1 flex overflow-hidden relative">
                <MainSidebar items={menuItems} secondaryItems={secondaryItems} homePath="/app" className="desktop-sidebar" hideBranding={true} hideFooter={true} />

                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                    <main className="flex-1 flex flex-col min-w-0 h-auto lg:h-full overflow-y-auto no-scrollbar bg-gray-50 dark:bg-dark-950 relative content-area-main">


                        {/* Page Header REMOVED - Moved back to Global Header */}

                        <div className="page-main-wrapper flex flex-col flex-1">
                            <div className={`page-frame-container w-full flex flex-col ${noPadding ? 'p-0' : ''}`}>
                                {/* Unified Page Toolbar: Filters (Left/Right) + Actions (Opposite) */}
                                {(toolbar || primaryAction || extraActions.length > 0) && (
                                    <div className="sticky top-0 z-40 mb-6 py-4 -mt-4 bg-gray-50/95 dark:bg-dark-950/95 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 in-page-toolbar transition-all duration-200">

                                        {/* Page Specific Toolbar (Filters/Tabs) */}
                                        <div className="flex-1 w-full lg:w-auto overflow-hidden">
                                            {toolbar}
                                        </div>

                                        {/* Global Actions (Buttons) - Moved from Footer */}
                                        <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                                            {extraActions.map((action, idx) => (
                                                <Button
                                                    key={idx}
                                                    onClick={action.onClick}
                                                    disabled={action.disabled || action.loading}
                                                    variant="secondary"
                                                    icon={action.icon || Plus}
                                                    isLoading={action.loading}
                                                >
                                                    {action.label}
                                                </Button>
                                            ))}
                                            {primaryAction && (
                                                <Button
                                                    onClick={primaryAction.onClick}
                                                    disabled={primaryAction.disabled || primaryAction.loading}
                                                    variant={primaryAction.variant === 'danger' ? 'danger' : 'primary'}
                                                    icon={primaryAction.icon || Plus}
                                                    isLoading={primaryAction.loading}
                                                >
                                                    {primaryAction.label}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {children}

                                {/* Local Page Footer REMOVED */}
                                <div id="table-pagination-portal" className="flex items-center mt-4" />
                            </div>
                        </div>
                    </main>

                    {/* Trial Banner Section - Fixed at bottom opposite Sidebar Footer */}
                    <div className="shrink-0 z-30">
                        <TrialBanner />
                    </div>
                </div>
            </div>


            <Drawer
                isOpen={isRightDrawerOpen}
                onClose={closeDrawers}
                side="right"
                branding={
                    <div className="flex items-center gap-4">
                        {settings.systemLogoUrl && (
                            <img src={settings.systemLogoUrl} alt={settings.appName} className="h-10 w-auto" />
                        )}
                        <span className="font-black text-lg text-gray-900 dark:text-white truncate">
                            {settings.appName}
                        </span>
                    </div>
                }
            >
                <div className="flex flex-col h-full">
                    {/* Drawer Branding REMOVED - Moved to Drawer Header */}

                    {/* Drawer Navigation */}
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
                        {([...menuItems, ...secondaryItems] as any[]).map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeDrawers}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Icon className={`w-5 h-5 ${item.color && !isActive ? item.color : ''}`} />
                                    <span className="text-sm flex-1">{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={`text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Drawer Footer (User & Logout) */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50">
                        <NameHeaderLeft
                            user={user}
                            onLogout={logoutTenant}
                            settingsPath="/app/settings"
                        />
                    </div>
                </div>
            </Drawer>




        </div >
    );
};

export default AppLayout;
