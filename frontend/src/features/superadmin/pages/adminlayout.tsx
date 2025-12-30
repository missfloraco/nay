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
    Code,
    Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import BottomNav from '@/shared/layout/footer/footer';
import { CopyrightFooterRight } from '@/shared/layout/footer/copyright-footer-right';
import { useAction } from '@/shared/contexts/action-context';
import { Header } from '@/shared/layout/header/header';

import { StatusWidget } from '@/shared/components/statuswidget';
import { LeftSidebar } from '@/shared/layout/sidebar/sidebar-left';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    leftSidebarContent?: ReactNode; // محتوى مخصص للشريط الأيسر
    leftSidebarNoPadding?: boolean;
    leftSidebarNoBorder?: boolean;
    hideLeftSidebar?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noPadding = false, leftSidebarContent, leftSidebarNoPadding = false, leftSidebarNoBorder = false, hideLeftSidebar = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, logout } = useAdminAuth();
    const { settings } = useSettings();
    const { primaryAction, setPrimaryAction } = useAction();
    const { isRightDrawerOpen, isLeftDrawerOpen, closeDrawers, toggleRightDrawer } = useUI();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { t } = useText();

    // Poll for unread notifications (Moved from Header)
    const { data: notificationData } = useQuery({
        queryKey: ['admin-notifications-count'],
        queryFn: () => api.get('/admin/notifications/support'),
        refetchInterval: 5000,
        enabled: !!user
    });

    const unreadCount = (notificationData as unknown as { count: number })?.count || 0;

    // Poll for trash stats
    const { data: trashData } = useQuery({
        queryKey: ['admin-trash-count'],
        queryFn: () => api.get('/admin/trash'),
        refetchInterval: 10000,
        enabled: !!user
    });

    const trashCount = (trashData as any)?.stats?.total || 0;

    const navItems = [
        { icon: Layout, label: t('admin.NAV.IDENTITY', 'هوية المنصة'), path: '/admin/identity', color: 'text-purple-600' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]' },
        { icon: Wallet, label: t('admin.NAV.PAYMENTS', 'إدارة المدفوعات'), path: '/admin/payments', color: 'text-emerald-600' },
        { icon: BarChart3, label: 'إدارة SEO', path: '/admin/seo', color: 'text-blue-600' },
        { icon: Megaphone, label: t('admin.NAV.ADS', 'إدارة الإعلانات'), path: '/admin/ads', color: 'text-[#fb005e]' },
        { icon: Code, label: 'الأكواد والنصوص', path: '/admin/scripts', color: 'text-amber-600' },
        { icon: Shield, label: 'إعدادات الحماية', path: '/admin/security', color: 'text-rose-600' },
        { icon: MessageSquare, label: t('admin.NAV.SUPPORT', 'رسائل الدعم'), path: '/admin/support', color: 'text-[#fb005e]', badge: unreadCount },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-600 font-black', badge: trashCount },
    ];

    return (
        <div className="layout-root" dir="rtl">
            {/* 1. Global Header - Full Width, Fixed Top */}
            <Header
                onMenuClick={() => { }}
                className="global-header"
                title={title || ''}
                userRole={t('admin.SETTINGS.SUPER_ADMIN_PRIVILEGES', 'مدير النظام')}
            />

            {/* 2. Main Layout Container */}
            <div className="main-content-wrapper">
                {/* 1. Main Navigation Sidebar (Fixed 250px) - Physically RIGHT in RTL (First Child) */}
                <aside
                    className="desktop-sidebar bg-white dark:bg-dark-950 border-l border-gray-200 dark:border-dark-700 z-40 transition-all duration-500 ease-in-out flex flex-col w-[250px]"
                >
                    <nav className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div key={item.path} className="relative group/item">
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold group relative overflow-hidden
                                        ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30 active-nav-item'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white'
                                            }`}
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

                    {/* Anchored Primary Action */}
                    <div className="flex flex-col border-t border-gray-200 dark:border-dark-700 bg-gray-50/30 dark:bg-dark-800/20">
                        <div className="h-[90px] px-6 flex items-center justify-center">
                            {primaryAction ? (
                                <button
                                    onClick={primaryAction.onClick}
                                    disabled={primaryAction.disabled || primaryAction.loading}
                                    className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 ${primaryAction.variant === 'danger' ? 'bg-red-600 shadow-red-500/20' : 'bg-primary shadow-primary/30'} text-white rounded-2xl shadow-lg transition-all font-black hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
                                >
                                    {primaryAction.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (primaryAction.icon ? <primaryAction.icon className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                                    <span className="text-sm">{primaryAction.label}</span>
                                </button>
                            ) : (
                                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">النظام جاهز للعمل</div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Mobile/Tablet Right Drawer (Admin Navigation) */}
                <Drawer
                    isOpen={isRightDrawerOpen}
                    onClose={closeDrawers}
                    side="right"
                    title={t('admin.navigation', 'لوحة تحكم المدير')}
                >
                    <nav className="p-6 space-y-1.5 h-full flex flex-col">
                        <div className="flex-1 space-y-1.5">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
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
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
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

                        {/* Admin Primary Action (Mobile) */}
                        {primaryAction && (
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
                                <button
                                    onClick={() => {
                                        primaryAction.onClick();
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

                {/* Mobile/Tablet Left Drawer (Contextual) */}
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

                {/* 2. Main Content Area - Full Width */}
                <div className="content-area-main relative overflow-hidden bg-gray-50 dark:bg-dark-950 flex-1">
                    <main className="h-full relative p-4">
                        <div className={`page-frame-container w-full h-full bg-white dark:bg-dark-950 flex flex-col overflow-auto no-scrollbar p-0`}>
                            {children}
                        </div>
                    </main>
                </div>

                {/* 3. Left Sidebar (Fixed 250px) - Physically LEFT in RTL (Last Child) */}
                {!hideLeftSidebar && (
                    <LeftSidebar noPadding={leftSidebarNoPadding} noBorder={leftSidebarNoBorder}>
                        {leftSidebarContent}
                    </LeftSidebar>
                )}
            </div>

            {/* 3. Global Footer - Full Width, Fixed Bottom */}
            <footer className="global-footer flex h-[90px] border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-950 items-center justify-between transition-all z-50">
                <div className="flex h-full items-center w-full">
                    {/* 1. Copyright Area - Physically RIGHT in RTL (First Child) */}
                    <CopyrightFooterRight />

                    {/* 2. Middle Spacer / Ad Space Placeholder (Fluid) */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                        <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-tight text-center">لوحة تحكم النظام الشاملة</div>
                    </div>
                    {/* 3. Status Section - Physically LEFT in RTL (Last Child) */}
                    <StatusWidget type="admin" />
                </div>
            </footer>


            {/* 4. Mobile Navigation Bar */}
            <div className="mobile-only">
                <BottomNav
                    items={navItems}
                    user={user}
                    onLogout={logout}
                    settingsPath="/admin/settings"
                    onMenuClick={toggleRightDrawer}
                />
            </div>
        </div>
    );
};

export default AdminLayout;
