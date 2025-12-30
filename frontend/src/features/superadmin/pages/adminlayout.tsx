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
    actions?: ReactNode;
    icon?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noPadding = false, leftSidebarContent, leftSidebarNoPadding = false, leftSidebarNoBorder = false, hideLeftSidebar = false, actions, icon }) => {
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
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-dark-950" dir="rtl">
            {/* 1. Main Navigation Sidebar (Fixed 250px) - Full Height Pillar */}
            <aside
                className="hidden lg:flex flex-col w-[250px] h-screen border-l border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-950 z-40 shrink-0 overflow-hidden"
            >
                {/* Top: Branding Section */}
                <div className="h-[90px] flex items-center shrink-0 border-b border-gray-100 dark:border-white/5 px-8">
                    <Link
                        to="/admin"
                        className="flex items-center gap-4 transition-all duration-300 hover:opacity-80 active:scale-95 group overflow-hidden"
                    >
                        <div className="flex items-center gap-3 truncate">
                            {(settings.systemLogoUrl || settings.logoUrl) ? (
                                <img
                                    src={settings.systemLogoUrl || settings.logoUrl || ''}
                                    alt={settings.appName || ''}
                                    className="h-9 w-auto max-w-[120px] object-contain group-hover:rotate-1 transition-transform logo-img"
                                />
                            ) : null}
                            <span
                                className="text-sm lg:text-lg font-black text-gray-900 dark:text-white transition-colors truncate block tracking-tight app-name-text"
                            >
                                {settings.appName}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Middle: Navigation Links */}
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

                {/* Bottom: Copyright Only */}
                <div className="mt-auto flex flex-col border-t border-gray-200 dark:border-dark-700 bg-gray-50/10 dark:bg-dark-800/5">
                    {/* Sidebar Copyright Adjustment */}
                    <div className="h-[90px] px-8 flex flex-col justify-center items-start text-right shrink-0">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 opacity-80 leading-none">جميع الحقوق محفوظة</span>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-400 leading-relaxed">
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
            </aside>

            {/* 2. Main Pillar (Header + Content + Footer) */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

                {/* Global Header */}
                <Header
                    onMenuClick={() => { }}
                    className="shrink-0"
                    title={title || ''}
                    icon={icon}
                    userRole={t('admin.SETTINGS.SUPER_ADMIN_PRIVILEGES', 'مدير النظام')}
                    hideBranding={true}
                    actions={
                        <div className="flex items-center gap-3">
                            {/* Manual Actions from Prop */}
                            {actions}

                            {/* Primary Action from Context (replaces Footer Action) */}
                            {primaryAction && (
                                <button
                                    onClick={primaryAction.onClick}
                                    disabled={primaryAction.disabled || primaryAction.loading}
                                    className={`flex items-center justify-center gap-2 py-2 px-4 ${primaryAction.variant === 'danger' ? 'bg-red-600 shadow-red-500/20' : 'bg-primary shadow-primary/30'} text-white rounded-lg shadow-md transition-all font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm`}
                                >
                                    {primaryAction.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                    <span>{primaryAction.label}</span>
                                </button>
                            )}
                        </div>
                    }
                />

                {/* Content Area + Sidebars */}
                <div className="flex-1 flex min-h-0 relative overflow-hidden bg-gray-50 dark:bg-dark-950">
                    {/* Main Main Page Content */}
                    <main className="flex-1 overflow-auto no-scrollbar relative">
                        <div className={`p-4 md:p-8 h-full ${noPadding ? 'p-0 md:p-0' : ''}`}>
                            {children}
                        </div>
                    </main>

                    {/* Left Filter/Settings Sidebar (Optional) */}
                    {!hideLeftSidebar && (
                        <div className="hidden lg:block shrink-0 h-full">
                            <LeftSidebar noPadding={leftSidebarNoPadding} noBorder={leftSidebarNoBorder}>
                                {leftSidebarContent}
                            </LeftSidebar>
                        </div>
                    )}
                </div>

                {/* Global Footer - Removed Primary Action */}
                <footer className="h-[90px] shrink-0 border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-950 flex items-center justify-between px-8 z-50 gap-4">
                    {/* Right Side: Status Widget */}
                    <div className="flex items-center">
                        <StatusWidget type="admin" />
                    </div>

                    {/* Middle Section: Hint Text */}
                    <div className="hidden md:flex flex-1 items-center justify-center overflow-hidden h-full">
                        <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-tight text-center">لوحة تحكم النظام الشاملة والمركزية</div>
                    </div>

                    {/* Left Side: Empty or Secondary Info */}
                    <div className="flex items-center justify-end min-w-[200px]">
                        <div className="text-[10px] font-black text-gray-300 dark:text-gray-700 opacity-50 uppercase tracking-widest">محفوظ</div>
                    </div>
                </footer>
            </div>

            {/* Drawers & Mobile Nav */}
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
