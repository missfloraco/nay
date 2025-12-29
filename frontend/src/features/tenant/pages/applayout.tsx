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
import { CopyrightFooterRight } from '@/shared/layout/footer/copyright-footer-right';
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

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    leftSidebarContent?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = '', noPadding = false, leftSidebarContent }) => {
    const { user, tenant, isImpersonating, logout: logoutTenant } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const { settings, isAdBlockActive, isCheckingAdBlock } = useSettings();
    const { t } = useText();
    const { primaryAction } = useAction();
    const isAdminSession = isImpersonating || !!adminUser;
    const location = useLocation();

    const handleExitImpersonation = async () => {
        try {
            await logoutTenant(false);
            // Assuming setTenants is available in this scope or passed as a prop if needed.
            // For this specific file, setTenants is not defined, so this line would cause an error.
            // Keeping it commented out or removed if it's not part of this component's state/props.
            // const res = await api.get('/admin/tenants');
            // setTenants(res.data || []);
        } catch (error) {
            logger.error(error);
        } finally {
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
        <div className={`h-screen bg-gray-50/50 dark:bg-dark-950 transition-colors duration-500 overflow-hidden flex flex-col ${isImpersonating ? 'pt-[64px]' : ''}`} dir="rtl">
            {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}
            <ImpersonationBanner
                tenantName={tenant?.name || '...'}
                onExit={handleExitImpersonation}
            />

            <Header
                onMenuClick={() => { }}
                title={title || ''}
            />

            <div className="flex h-[calc(100vh-180px)] overflow-hidden relative">
                <aside
                    className="hidden lg:flex lg:sticky top-0 bottom-0 w-[250px] shrink-0 h-full bg-white dark:bg-dark-900 border-l border-gray-300 dark:border-dark-600 z-40 transition-all duration-500 ease-in-out flex-col shadow-2xl lg:shadow-none"
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
                                        <item.icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="text-sm flex-1">
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

                    <div className="flex flex-col border-t border-gray-100 dark:border-dark-700 bg-gray-50/30 dark:bg-dark-800/20">
                        <div className="h-[90px] px-6 flex items-center justify-center">
                            {(() => {
                                const btnColorClass = 'bg-primary shadow-primary/30';
                                return primaryAction ? (
                                    <button
                                        type={primaryAction.type || 'button'}
                                        form={primaryAction.form}
                                        onClick={primaryAction.onClick}
                                        disabled={primaryAction.disabled || primaryAction.loading}
                                        className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 ${primaryAction.variant === 'danger' ? 'bg-red-600 shadow-red-500/20' : btnColorClass} text-white rounded-2xl shadow-lg transition-all font-black hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
                                    >
                                        {primaryAction.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : primaryAction.icon ? <primaryAction.icon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        <span className="text-sm">{primaryAction.label}</span>
                                    </button>
                                ) : null;
                            })()}
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 dark:bg-dark-950">
                    <main className="flex-1 overflow-hidden relative p-4">
                        <div className={`w-full h-full bg-white dark:bg-dark-900 flex flex-col overflow-y-auto no-scrollbar ${noPadding ? 'p-0' : 'p-6 md:p-8 lg:p-12 pb-32 md:pb-40 lg:pb-48'}`}>
                            {children}
                            {/* The following block was part of the instruction but is syntactically incorrect here.
                                It seems to be a misplaced snippet from another context, likely related to fetching tenants.
                                If `setTenants` and `showToast` are defined in this scope, it should be placed in a proper function/effect.
                                For now, it's commented out to maintain syntactical correctness of this file.
                            try {
                                const res: any = await api.get('/admin/tenants');
                                setTenants(res.data || []);
                            } catch (e) { logger.error('Failed to load tenants', e); }
                            };
                            try {
                                // Assuming this is part of a function that handles some action, e.g., a payment.
                                // The `notes: ''` line suggests it might be related to form submission or state.
                                // This block is placed here as per instruction, but its context is unclear.
                                // If `showToast` is not defined, it would cause an error.
                                // For now, it's commented out to maintain syntactical correctness.
                                // notes: ''
                            } catch (err: any) {
                                logger.error(err);
                                // showToast(err.response?.data?.message || 'فشل تسجيل الدفعة', 'error');
                            } finally {
                                // Any cleanup or final actions
                            }
                            */}
                        </div>
                    </main>
                </div>

                <LeftSidebar>
                    {leftSidebarContent}
                </LeftSidebar>
            </div>

            <footer className="flex h-[90px] border-t border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 items-center justify-between transition-all z-50">
                <div className="flex h-full items-center w-full">
                    <CopyrightFooterRight />

                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                        <AdSlot
                            placement="ad_footer_leaderboard"
                            className="w-full h-full"
                            showPlaceholder={false}
                        />
                    </div>

                    {!isAdminSession && (
                        <StatusWidget type="tenant" tenant={tenant} />
                    )}
                </div>
            </footer>

            <BottomNav items={menuItems} />
        </div>
    );
};

export default AppLayout;
