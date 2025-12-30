import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Settings,
    Trash2,
    Plus,
    Loader2,
    MessageSquare,
    Sparkles
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
import { LeftSidebar } from '@/shared/layout/sidebar/sidebar-left';
import ShieldOverlay from '@/shared/components/shield-overlay';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    leftSidebarContent?: ReactNode;
    actions?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = '', noPadding = false, leftSidebarContent, actions }) => {
    const { user, tenant, isImpersonating, logout: logoutTenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();
    const { t } = useText();
    const { primaryAction } = useAction();
    const { isRightDrawerOpen, isLeftDrawerOpen, closeDrawers, toggleRightDrawer } = useUI();
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
        { icon: MessageSquare, label: t('tenant.NAV.SUPPORT', 'رسائل الدعم'), path: '/app/support/messages', color: 'text-[#fb005e]', badge: unreadCount },
        { icon: Trash2, label: t('tenant.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/app/trash', color: 'text-red-600 font-black', badge: trashCount },
    ];

    return (
        <div className={`layout-root transition-colors duration-500 ${isImpersonating ? 'pt-[64px]' : ''}`} dir="rtl">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}
            <ImpersonationBanner
                tenantName={tenant?.name || '...'}
                onExit={handleExitImpersonation}
            />

            <Header
                onMenuClick={() => { }}
                className="global-header"
                title={title || ''}
                actions={
                    <div className="flex items-center gap-3">
                        {/* Manual Actions */}
                        {actions}

                        {/* Primary Action from Context (Replaces Footer) */}
                        {primaryAction && (
                            <button
                                type={primaryAction.type || 'button'}
                                form={primaryAction.form}
                                onClick={primaryAction.onClick}
                                disabled={primaryAction.disabled || primaryAction.loading}
                                className={`flex items-center justify-center gap-2 py-2 px-4 ${primaryAction.variant === 'danger' ? 'bg-red-600 shadow-red-500/20' : 'bg-primary shadow-primary/30'} text-white rounded-lg shadow-md transition-all font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm`}
                            >
                                {primaryAction.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span className="text-sm">{primaryAction.label}</span>
                            </button>
                        )}
                    </div>
                }
            />

            <div className="main-content-wrapper">
                <aside
                    className="desktop-sidebar bg-white dark:bg-dark-900 border-l border-gray-200 dark:border-dark-700 z-40 transition-all duration-500 ease-in-out flex flex-col w-[250px]"
                >
                    <nav className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <div key={item.path} className="relative group/item">
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold group relative overflow-hidden
                                        ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30 active-nav-item'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white'}`}
                                    >
                                        <item.icon className="w-5 h-5 transition-all duration-500 scale-110" />
                                        <span className="sidebar-label-text text-sm flex-1">
                                            {item.label}
                                        </span>
                                        {(item as any).badge > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                                                {(item as any).badge > 9 ? '9+' : (item as any).badge}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="flex flex-col border-t border-gray-200 dark:border-dark-700 bg-gray-50/30 dark:bg-dark-800/20">
                        {/* Removed Primary Action from Sidebar */}
                    </div>
                </aside>

                {/* Mobile/Tablet Right Drawer (Global Navigation) */}
                <Drawer
                    isOpen={isRightDrawerOpen}
                    onClose={closeDrawers}
                    side="right"
                    title={t('common.navigation', 'التنقل الرئيسي')}
                >
                    <nav className="p-6 space-y-1.5 h-full flex flex-col">
                        <div className="flex-1 space-y-1.5">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={closeDrawers}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold
                                        ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white'}`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm flex-1">{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Primary Action (Inside Drawer) */}
                        {primaryAction && (
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
                                <button
                                    onClick={() => {
                                        primaryAction.onClick?.();
                                        closeDrawers();
                                    }}
                                    className={`flex items-center justify-center gap-3 w-full py-4 px-6 ${primaryAction.variant === 'danger' ? 'bg-red-600' : 'bg-primary'} text-white rounded-2xl shadow-lg font-black transition-all`}
                                >
                                    {primaryAction.icon ? <primaryAction.icon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    <span className="text-sm">{primaryAction.label}</span>
                                </button>
                            </div>
                        )}
                    </nav>
                </Drawer>

                {/* Mobile/Tablet Left Drawer (Contextual Sidebar) */}
                {leftSidebarContent && (
                    <Drawer
                        isOpen={isLeftDrawerOpen}
                        onClose={closeDrawers}
                        side="left"
                        title={t('common.options', 'خيارات إضافية')}
                    >
                        <div className="h-full flex flex-col py-4" onClick={closeDrawers}>
                            {leftSidebarContent}
                        </div>
                    </Drawer>
                )}

                <div className="content-area-main relative overflow-hidden bg-gray-50 dark:bg-dark-950 flex-1">
                    <main className="h-full relative p-4">
                        <div className={`page-frame-container w-full h-full bg-white dark:bg-dark-900 flex flex-col overflow-auto no-scrollbar p-0`}>
                            {children}
                        </div>
                    </main>
                </div>

                <LeftSidebar>
                    {leftSidebarContent}
                </LeftSidebar>
            </div>

            <footer className="global-footer flex h-[90px] border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 items-center justify-between transition-all z-50">
                <div className="flex h-full items-center w-full gap-4 pr-0 pl-8">
                    {/* Integrated Copyright Section - Updates applied */}
                    <div className="flex w-[250px] h-full border-l border-gray-300 dark:border-dark-600 px-8 items-center justify-start text-right bg-gray-50/10 dark:bg-dark-800/5 shrink-0">
                        <div className="flex flex-col items-start text-right w-full">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 opacity-80 leading-none uppercase">جميع الحقوق محفوظة</span>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-400 leading-relaxed text-right">
                                منصة {settings?.appName || 'النظام'} © {new Date().getFullYear()}
                                <br />
                                <span className="text-[11px] opacity-70">
                                    {settings?.companyName && <>أحد مشاريع </>}
                                    {settings?.companyLink ? (
                                        <a href={settings.companyLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors hover:underline decoration-primary/30 underline-offset-4 cursor-pointer font-black">
                                            {settings?.companyName || ''}
                                        </a>
                                    ) : (
                                        <span className="text-primary font-black">{settings?.companyName || ''}</span>
                                    )}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                        <AdSlot
                            placement="ad_footer_leaderboard"
                            className="w-full h-full"
                            showPlaceholder={false}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Primary Action Button Removed from Footer and moved to Header */}
                        <div className="flex items-center justify-end min-w-[140px]">
                            {/* Empty placeholder if needed, or just remove */}
                        </div>

                        {!isAdminSession && (
                            <StatusWidget type="tenant" tenant={tenant} />
                        )}
                    </div>
                </div>
            </footer>

            {/* Mobile Navigation Bar */}
            <div className="mobile-only">
                <BottomNav
                    items={menuItems}
                    user={user}
                    onLogout={() => logoutTenant(false)}
                    settingsPath="/app/settings"
                />
            </div>
        </div>
    );
};

export default AppLayout;
