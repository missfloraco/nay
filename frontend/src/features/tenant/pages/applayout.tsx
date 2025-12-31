import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Settings,
    Trash2,
    Plus,
    Loader2,
    MessageSquare,
    Sparkles,
    Layers
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import BottomNav from '@/shared/layout/footer/footer';
import { useAction } from '@/shared/contexts/action-context';
import { useText } from '@/shared/contexts/text-context';
import { Header } from '@/shared/layout/header/header';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import AdSlot from '@/shared/ads/adslot';
import { StatusWidget } from '@/shared/components/statuswidget';
import { ImpersonationBanner } from '@/shared/components/impersonationbanner';
import ShieldOverlay from '@/shared/components/shield-overlay';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';
import { MainSidebar } from '@/shared/layout/sidebar/sidebar-main';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = '', icon, noPadding = false, actions }) => {
    const { user, tenant, isImpersonating, logout: logoutTenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();
    const { t } = useText();
    const { primaryAction } = useAction();
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

    const { data: notificationData } = useQuery({
        queryKey: ['support-notifications-count'],
        queryFn: () => api.get('/app/support/notifications/support'),
        refetchInterval: 5000,
        enabled: !!user
    });

    const unreadCount = (notificationData as unknown as { count: number })?.count || 0;

    const { data: trashData } = useQuery({
        queryKey: ['trash-count'],
        queryFn: () => api.get('/app/trash'),
        refetchInterval: 10000,
        enabled: !!user
    });

    const trashCount = (trashData as any)?.stats?.total || 0;

    const menuItems = [
        { icon: Layers, label: t('tenant.NAV.DASHBOARD', 'لوحة التحكم'), path: '/app', color: 'text-blue-600' },
        { icon: MessageSquare, label: t('tenant.NAV.SUPPORT', 'رسائل الدعم'), path: '/app/support/messages', color: 'text-[#fb005e]', badge: unreadCount },
        { icon: Trash2, label: t('tenant.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/app/trash', color: 'text-red-600 font-black', badge: trashCount },
    ];

    return (
        <div className={`transition-colors duration-500 h-screen w-full overflow-hidden flex bg-white dark:bg-dark-950 ${isImpersonating ? 'pt-[64px]' : ''}`} dir="rtl">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}
            <ImpersonationBanner tenantName={tenant?.name || '...'} onExit={handleExitImpersonation} />

            {/* 1. Main Navigation Sidebar - Full Height */}
            <MainSidebar items={menuItems} homePath="/app/welcome" className="desktop-sidebar" />

            {/* 2. Content Column Pillar */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                <Header onMenuClick={() => { }} className="global-header shrink-0" title={title || ''} icon={icon} hideBranding={true} actions={
                    <div className="flex items-center gap-3">
                        {actions}
                        {primaryAction && (
                            <button type={primaryAction.type || 'button'} form={primaryAction.form} onClick={primaryAction.onClick} disabled={primaryAction.disabled || primaryAction.loading} className={`flex items-center justify-center gap-2 py-2 px-4 ${primaryAction.variant === 'danger' ? 'bg-red-600' : 'bg-primary'} text-white rounded-lg shadow-md transition-all font-bold hover:scale-[1.02] text-sm`}>
                                {primaryAction.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span className="text-sm">{primaryAction.label}</span>
                            </button>
                        )}
                    </div>
                } />

                <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-dark-950">
                    <div className="flex-1 flex overflow-hidden p-[var(--page-margin)] pb-0 gap-[var(--page-margin)]">
                        <main className="flex-1 overflow-auto no-scrollbar relative flex flex-col mb-[var(--page-margin)]">
                            <div className="page-main-wrapper flex flex-col flex-1">
                                <div className={`page-frame-container flex-1 flex flex-col ${noPadding ? 'p-0' : ''}`}>
                                    {children}
                                </div>
                            </div>
                        </main>
                    </div>

                    <footer className="z-40 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 h-[90px] flex items-center justify-between px-12 transition-all shrink-0">
                        <div className="flex items-center gap-6"></div>
                        <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                            <AdSlot placement="ad_footer_leaderboard" className="w-full h-full" showPlaceholder={false} />
                        </div>
                        <div className="flex items-center gap-6">
                            {primaryAction && (
                                <button onClick={primaryAction.onClick} disabled={primaryAction.disabled || primaryAction.loading} className={`hidden lg:flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl transition-all font-black text-sm uppercase ${primaryAction.variant === 'danger' ? 'bg-red-600' : 'bg-primary'} text-white`}>
                                    {primaryAction.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : React.createElement(primaryAction.icon || Plus, { className: "w-5 h-5" })}
                                    <span className="text-base">{primaryAction.label}</span>
                                </button>
                            )}
                            {!isAdminSession && <StatusWidget type="tenant" tenant={tenant} />}
                        </div>
                    </footer>
                </div>
            </div>


            <Drawer isOpen={isRightDrawerOpen} onClose={closeDrawers} side="right" title={t('common.navigation', 'التنقل الرئيسي')}>
                <nav className="p-6 space-y-1.5 h-full flex flex-col">
                    <div className="flex-1 space-y-1.5">
                        {menuItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={closeDrawers} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${location.pathname.startsWith(item.path) ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm flex-1">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </Drawer>


            <div className="mobile-only">
                <BottomNav items={menuItems} user={user} onLogout={() => logoutTenant(false)} settingsPath="/app/settings" />
            </div>
        </div>
    );
};

export default AppLayout;
