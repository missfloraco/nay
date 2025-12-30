import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Loader2, ShoppingCart, Plus, Settings, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAction } from '@/shared/contexts/action-context';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    color?: string;
}

export interface BottomNavProps {
    items: NavItem[];
    user?: {
        name: string;
        avatar_url?: string;
        avatarUrl?: string; // Handle both cases for compatibility
        uid?: string;
    } | null;
    onLogout?: () => void;
    settingsPath?: string;
    onMenuClick?: () => void;
}

export default function BottomNav({ items, user, onLogout, settingsPath = '/settings', onMenuClick }: BottomNavProps) {
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { primaryAction } = useAction();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const avatarUrl = resolveAssetUrl(user?.avatar_url || user?.avatarUrl) || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=02aa94&color=fff`;

    return (
        <>
            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 py-2 flex items-center justify-between transition-all h-[70px] pb-safe">

                {/* 
                    RTL Layout Logic:
                    Container is Flex Row. In RTL (dir="rtl"), Start is Right, End is Left.
                    Order:
                    1. Burger Menu (Start/Right)
                    2. FAB (Center)
                    3. User Profile (End/Left)
                */}

                {/* 1. Right (Start): Burger Menu (Drawer Trigger) */}
                <div className="flex-1 flex justify-start items-center">
                    <button
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center transition-all text-gray-400 dark:text-gray-600 active:scale-95 hover:text-primary dark:hover:text-primary"
                    >
                        <div className="p-3 rounded-2xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Menu className="w-7 h-7" />
                        </div>
                    </button>
                </div>

                {/* 2. Center: Main Floating Action Button */}
                <div className="px-2 -translate-y-8 relative z-50">
                    {primaryAction ? (
                        <button
                            onClick={primaryAction.onClick}
                            disabled={primaryAction.disabled || primaryAction.loading}
                            className={`flex items-center justify-center w-16 h-16 ${primaryAction.variant === 'danger' ? 'bg-red-600 shadow-red-500/40' : 'bg-primary shadow-primary/40'} text-white rounded-full shadow-2xl transform transition-all active:scale-90 hover:scale-105 ring-[6px] ring-white dark:ring-gray-950`}
                        >
                            {primaryAction.loading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                React.createElement(primaryAction.icon || Plus, { className: "w-8 h-8 font-bold" })
                            )}
                        </button>
                    ) : (
                        <Link
                            to="/app/pos"
                            className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-700 text-white rounded-full shadow-2xl shadow-blue-500/40 transform transition-all active:scale-90 hover:scale-105 ring-[6px] ring-white dark:ring-gray-950"
                        >
                            <ShoppingCart className="w-8 h-8 font-bold" />
                        </Link>
                    )}
                </div>

                {/* 3. Left (End): User Profile (Settings/Logout) */}
                <div className="flex-1 flex justify-end items-center" ref={userMenuRef}>
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex flex-col items-center justify-center transition-all active:scale-95"
                        >
                            <div className={`p-0.5 rounded-full border-2 transition-all ${isUserMenuOpen ? 'border-primary shadow-sm shadow-primary/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                <img
                                    src={avatarUrl}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                                />
                            </div>
                        </button>

                        {/* User Menu Popover */}
                        {isUserMenuOpen && (
                            <div className="absolute bottom-[70px] left-0 w-[200px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 animate-in fade-in slide-in-from-bottom-4 duration-300 origin-bottom-left z-[60]">
                                <div className="p-3 border-b border-gray-50 dark:border-gray-800 mb-1">
                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate">{user?.uid || ''}</p>
                                </div>
                                <div className="space-y-1">
                                    <Link
                                        to={settingsPath}
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="font-bold text-xs">الإعدادات</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="font-bold text-xs">تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </nav>
        </>
    );
}
