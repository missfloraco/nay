import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '@/shared/contexts/app-context';
import { useUI } from '@/shared/contexts/ui-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import AdSlot from '@/shared/ads/adslot';
import {
    ChevronRight,
    ChevronLeft,
    LogOut,
    Settings as SettingsIcon,
    ChevronDown
} from 'lucide-react';

interface NavItem {
    icon?: any;
    label: string;
    path?: string;
    color?: string;
    badge?: number;
}

interface SidebarProps {
    items: NavItem[];
    secondaryItems?: NavItem[];
    homePath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    items,
    secondaryItems = [],
    homePath
}) => {
    const { settings } = useSettings();
    const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed, isMobileMenuOpen, closeMobileMenu } = useUI();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { user: adminUser, logout: logoutAdmin } = useAdminAuth();
    const { user: appUser, logout: logoutApp } = useTenantAuth();

    const isAdmin = location.pathname.startsWith('/admin');
    const currentUser = isAdmin ? adminUser : appUser;

    const handleLogout = async () => {
        if (isAdmin) {
            await logoutAdmin();
        } else {
            await logoutApp();
        }
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const avatarUrl = resolveAssetUrl(currentUser?.avatar_url || (currentUser as any)?.avatarUrl) || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=02aa94&color=fff`;

    const renderNavItem = (item: NavItem) => {
        const isActive = location.pathname.startsWith(item.path!);
        return (
            <Link
                key={item.path}
                to={item.path!}
                onClick={() => {
                    if (isSidebarCollapsed) {
                        setSidebarCollapsed(false);
                    }
                    if (window.innerWidth < 1024) closeMobileMenu();
                }}
                className={`flex items-center group relative h-14 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-2xl
                    ${isActive
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
            >
                {/* 1. Icon Zone - Fixed position anchor */}
                <div className="w-[88px] h-full flex items-center justify-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 group-active:scale-95 
                        ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : `bg-gray-50 dark:bg-white/5 ${item.color || 'text-gray-500'} hover:text-gray-900 dark:hover:text-white`
                        }`}>
                        {item.icon && <item.icon className="w-5 h-5" />}
                    </div>
                </div>

                {/* 2. Label Zone - Dynamic push/expand */}
                <span
                    className={`text-sm font-bold truncate transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden
                        ${isSidebarCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-full opacity-100'}
                    `}
                >
                    {item.label}
                </span>

                {/* Badge - Anchored to icon in collapsed, beside text in expanded */}
                {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                        flex items-center justify-center text-[10px] rounded-full px-1 min-w-[20px] h-5 transition-all duration-500
                        ${isSidebarCollapsed ? 'absolute top-1 right-3 scale-75' : 'mr-4'}
                        ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white shadow-sm'}
                    `}>
                        {item.badge > 9 ? '9+' : item.badge}
                    </span>
                )}

                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                    <div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                        <div className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-gray-900" />
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobileMenu}
            />

            {/* Sidebar Content */}
            <aside
                className={`fixed lg:static inset-y-0 right-0 z-[70] flex flex-col bg-white dark:bg-dark-900 border-l border-gray-100 dark:border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isMobileMenuOpen ? 'translate-x-0 w-[250px]' : 'translate-x-full lg:translate-x-0'}
                    ${isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[250px]'}
                `}
            >

                {/* 1. Top Section: Branding */}
                <div className="h-[90px] flex items-center shrink-0 border-b border-gray-100 dark:border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <Link to={homePath} className="flex items-center group overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                        {/* Fixed Logo Anchor */}
                        <div className="w-[88px] flex items-center justify-center shrink-0">
                            {(settings.systemLogoUrl || settings.logoUrl) && (
                                <img
                                    src={settings.systemLogoUrl || settings.logoUrl || ''}
                                    alt={settings.appName || ''}
                                    className="w-10 h-10 object-contain transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 group-hover:rotate-3 logo-img shrink-0"
                                />
                            )}
                        </div>

                        {/* Dynamic App Name */}
                        <span className={`text-lg font-black text-gray-900 dark:text-white truncate transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? 'max-w-0 opacity-0 invisible' : 'max-w-full opacity-100 visible'}`}>
                            {settings.appName}
                        </span>
                    </Link>
                </div>

                {/* 2. Middle Section: Nav Items */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 py-4">
                    {items.map((item) => renderNavItem(item))}
                    {secondaryItems.length > 0 && (
                        <div className="mt-2 text-transparent h-px" />
                    )}
                    {secondaryItems.map((item) => renderNavItem(item))}
                </div>

                {/* Sidebar Ad Slot */}
                {!isSidebarCollapsed && (
                    <div className="w-full shrink-0 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-dark-900">
                        <AdSlot placement="ad_sidebar" className="w-full aspect-[250/250]" showPlaceholder={false} />
                    </div>
                )}

                {/* 3. Bottom Section: Controls & Profile */}
                <div className="shrink-0 border-t border-gray-100 dark:border-white/5 pb-6 pt-2">
                    {/* Collapse Toggle - Icon Only, Centered, Hidden on Mobile */}
                    <div className="hidden lg:flex justify-center mb-2">
                        <button
                            onClick={() => {
                                toggleSidebar();
                            }}
                            className="flex items-center justify-center h-12 w-12 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group relative"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 group-hover:bg-gray-100 dark:group-hover:bg-white/10">
                                {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                            </div>

                            {isSidebarCollapsed && (
                                <div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                    توسيع القائمة
                                    <div className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-gray-900" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* User Profile Section - Now at Bottom */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center w-full h-12 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-2xl group hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                            {/* Fixed Avatar Anchor */}
                            <div className="w-[88px] flex items-center justify-center shrink-0">
                                <img
                                    src={avatarUrl}
                                    alt={currentUser?.name}
                                    className={`rounded-full border border-gray-100 dark:border-white/10 shadow-sm object-cover transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}
                                />
                            </div>

                            {/* Dynamic User Info */}
                            <div
                                className={`flex-1 flex flex-col items-start leading-tight overflow-hidden text-right transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap
                                    ${isSidebarCollapsed ? 'max-w-0 opacity-0 invisible' : 'max-w-full opacity-100 visible'}
                                `}
                            >
                                <span className="text-sm font-black text-gray-900 dark:text-white truncate w-full">
                                    {currentUser?.name || 'المستخدم'}
                                </span>
                            </div>

                            <div className={`transition-all duration-500 flex items-center justify-center ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-10 opacity-100'}`}>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu - Always Opens Upwards */}
                        {isUserMenuOpen && (
                            <div className="absolute bottom-full mb-2 left-4 right-4 lg:left-0 lg:right-0 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors group"
                                >
                                    <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-xs">تسجيل الخروج</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside >
        </>
    );
};
