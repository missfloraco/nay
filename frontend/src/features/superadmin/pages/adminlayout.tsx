import React, { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Users,
    CreditCard,
    Trash2,
    Plus,
    Settings,
    BarChart3,
    Layout,
    LayoutDashboard,
    Activity,
    Megaphone,
    Monitor,
    Wallet,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    Loader2,
    X,
    Sparkles,
    Hash,
    Crown,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';

import { useAction } from '@/shared/contexts/action-context';
import { Header } from '@/shared/layout/header/header';
import AdSlot from '@/shared/ads/adslot';

import { StatusWidget } from '@/shared/components/statuswidget';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';
import { MainSidebar } from '@/shared/layout/sidebar/sidebar-main';
import { MobileNavLinks } from '@/shared/layout/sidebar/mobile-nav-links';
import { NameHeaderLeft } from '@/shared/layout/header/name-header-left';
import Button from '@/shared/ui/buttons/btn-base';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
    toolbar?: ReactNode; // New prop for local controls (Filters, Tabs, etc.)
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noPadding = false, actions, icon, toolbar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, logout } = useAdminAuth();
    const { settings } = useSettings();
    const { primaryAction, setPrimaryAction, extraActions } = useAction();
    const { isRightDrawerOpen, closeDrawers, toggleRightDrawer } = useUI();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { t } = useText();


    const { data: trashData } = useQuery({
        queryKey: ['admin-trash-count'],
        queryFn: () => api.get('/admin/trash'),
        refetchInterval: 10000,
        enabled: !!user
    });

    const trashCount = (trashData as any)?.stats?.total || 0;

    const navItems = React.useMemo(() => [
        { isHeader: true, label: 'الرئيسية' },
        { icon: LayoutDashboard, label: t('admin.NAV.DASHBOARD', 'لوحة التحكم'), path: '/admin/dashboard', color: 'text-blue-600' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]' },
        { icon: Crown, label: 'الخطط السعرية', path: '/admin/plans', color: 'text-orange-500' },

        { isHeader: true, label: 'الهوية والتصميم' },
        { icon: Layout, label: 'هوية المنصة', path: '/admin/identity', color: 'text-indigo-600' },

        { icon: CreditCard, label: 'طرق الدفع', path: '/admin/payment-methods', color: 'text-emerald-500' },

        { isHeader: true, label: 'النظام' },
    ], [t, trashCount]);

    const secondaryItems = React.useMemo(() => [
        { icon: Settings, label: t('admin.NAV.SETTINGS', 'الإعدادات العامة'), path: '/admin/settings', color: 'text-gray-600' },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-600 font-black', badge: trashCount },
    ], [t, trashCount]);

    return (
        <div className="flex flex-col min-h-screen lg:h-screen w-full lg:overflow-hidden bg-white dark:bg-dark-950" dir="rtl">

            {/* 1. Full Width Header */}
            <Header onMenuClick={toggleRightDrawer} title={title} actions={actions} icon={icon} />

            {/* 2. Middle Section (Sidebar + Content) */}
            <div className="flex-1 flex overflow-hidden relative">
                <MainSidebar items={navItems} secondaryItems={secondaryItems} homePath="/admin" hideBranding={true} hideFooter={true} />

                <main className="flex-1 flex flex-col min-w-0 h-auto lg:h-full overflow-y-auto no-scrollbar bg-gray-50 dark:bg-dark-950 relative content-area-main">


                    {/* Content Wrapper */}
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
            </div>

            {/* Drawers & Mobile Nav */}

            {/* Drawers & Mobile Nav */}
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
                    <MobileNavLinks
                        items={[...navItems, ...secondaryItems]}
                        onClose={closeDrawers}
                    />

                    {/* Drawer Footer (User & Logout) */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50">
                        <NameHeaderLeft
                            user={user}
                            onLogout={logout}
                            settingsPath="/admin/settings"
                        />
                    </div>
                </div>
            </Drawer>




        </div >
    );
};

export default AdminLayout;
