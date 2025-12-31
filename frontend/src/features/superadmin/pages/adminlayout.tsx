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
import AdSlot from '@/shared/ads/adslot';

import { StatusWidget } from '@/shared/components/statuswidget';
import { useUI } from '@/shared/contexts/ui-context';
import { Drawer } from '@/shared/ui/drawer';
import { MainSidebar } from '@/shared/layout/sidebar/sidebar-main';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    noPadding?: boolean;
    actions?: ReactNode;
    icon?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noPadding = false, actions, icon }) => {
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
        { icon: LayoutDashboard, label: t('admin.NAV.DASHBOARD', 'لوحة التحكم'), path: '/admin/dashboard', color: 'text-blue-600' },
        { icon: Users, label: t('admin.NAV.TENANTS', 'إدارة المشتركين'), path: '/admin/tenants', color: 'text-[#02aa94]' },
        { icon: BarChart3, label: 'إدارة SEO', path: '/admin/seo', color: 'text-blue-600' },
        { icon: Megaphone, label: t('admin.NAV.ADS', 'إدارة الإعلانات'), path: '/admin/ads', color: 'text-[#fb005e]' },
        { icon: Code, label: 'الأكواد والنصوص', path: '/admin/scripts', color: 'text-amber-600' },
        { icon: Shield, label: 'إعدادات الحماية', path: '/admin/security', color: 'text-rose-600' },
        { icon: Trash2, label: t('admin.NAV.RECYCLE_BIN', 'سلة المحذوفات'), path: '/admin/trash', color: 'text-red-600 font-black', badge: trashCount },
    ], [t, trashCount]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-dark-950" dir="rtl">
            {/* 1. Main Navigation Sidebar */}
            <MainSidebar items={navItems} homePath="/admin" />

            {/* 2. Content Column Pillar */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                <Header onMenuClick={() => { }} title={title || ''} icon={icon} hideBranding={true} />

                <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-dark-950">
                    {/* Middle Area */}
                    <div className="flex-1 flex overflow-hidden">
                        <main className="flex-1 overflow-auto no-scrollbar relative flex flex-col">
                            <div className="page-main-wrapper flex flex-col flex-1">
                                <div className={`page-frame-container flex-1 flex flex-col ${noPadding ? 'p-0' : ''}`}>
                                    {children}
                                </div>
                            </div>
                        </main>

                    </div>

                    {/* Flush Footer Area */}
                    <footer className="z-40 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 h-[90px] flex items-center justify-between transition-all shrink-0">
                        <div className="flex items-center gap-6 pr-12">
                            {actions}
                            <div id="table-pagination-portal" className="flex items-center" />
                        </div>
                        <div className="flex items-center h-full">
                            <div className="flex items-center gap-6 px-6 shrink-0 h-full border-r border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                                {extraActions.map((action, idx) => (
                                    <button key={idx} onClick={action.onClick} disabled={action.disabled || action.loading} className={`hidden lg:flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm`}>
                                        {action.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : React.createElement(action.icon || Plus, { className: "w-5 h-5 text-gray-500" })}
                                        <span className="flex-1">{action.label}</span>
                                    </button>
                                ))}
                                {primaryAction && (
                                    <button onClick={primaryAction.onClick} disabled={primaryAction.disabled || primaryAction.loading} className={`hidden lg:flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${primaryAction.variant === 'danger' ? 'bg-red-600 text-white' : 'bg-primary text-white'} shadow-lg disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:shadow-none`}>
                                        {primaryAction.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : React.createElement(primaryAction.icon || Plus, { className: "w-5 h-5" })}
                                        <span className="flex-1">{primaryAction.label}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Drawers & Mobile Nav */}
            <Drawer isOpen={isRightDrawerOpen} onClose={closeDrawers} side="right" title={t('admin.navigation', 'لوحة تحكم المدير')}>
                <nav className="p-6 space-y-1.5 h-full flex flex-col">
                    <div className="flex-1 space-y-1.5">
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path} onClick={closeDrawers} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${location.pathname === item.path ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800/50'}`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="text-sm flex-1">{item.label}</span>
                                {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">{item.badge}</span>}
                            </Link>
                        ))}
                    </div>
                </nav>
            </Drawer>


            <div className="mobile-only">
                <BottomNav items={navItems} user={user} onLogout={logout} settingsPath="/admin/settings" onMenuClick={toggleRightDrawer} />
            </div>
        </div>
    );
};

export default AdminLayout;
