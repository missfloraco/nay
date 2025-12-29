import React, { useState } from 'react';
import { Menu, X, Loader2, ShoppingCart, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAction } from '@/shared/contexts/action-context';

import { LucideIcon } from 'lucide-react';

export interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    color?: string;
}

interface BottomNavProps {
    items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { primaryAction } = useAction();

    // Determine fast access items (first 4 items usually)
    // We display 2 on left, 2 on right (in LTR) - reversed in RTL
    // Slicing to get just the direct access buttons
    const barItems = items.slice(0, 4);

    return (
        <>
            {/* Backdrop for Menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] animate-in fade-in duration-500"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Slide-up Menu Drawer (Full Screen on Mobile) */}
            <div className={`fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-gray-950 rounded-t-[3rem] border-t border-gray-100 dark:border-gray-800 shadow-2xl transition-transform duration-500 ease-out flex flex-col h-[85vh] ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-6 mb-2" />
                <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">القائمة</h3>
                            <p className="text-sm text-gray-500 font-bold">وصول سريع لجميع الأقسام</p>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white transition-transform active:scale-95"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]'
                                        : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 group'
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-white/20' : 'bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110'}`}>
                                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight">{item.label}</span>
                                        <span className={`text-[10px] font-bold ${isActive ? 'text-white/70' : 'text-gray-400'}`}>انتقال</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sticky Professional Bottom Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 py-2 flex items-center justify-between transition-all h-[80px] pb-safe">
                <div className="flex flex-1 justify-around items-center h-full">
                    {/* First 2 Items */}
                    {barItems.slice(0, 2).map(item => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-gray-400 dark:text-gray-600'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-primary/10 shadow-sm' : ''}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Central Context-Aware Button */}
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

                <div className="flex flex-1 justify-around items-center h-full">
                    {/* Next Item (3rd) */}
                    {barItems.slice(2, 3).map(item => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-gray-400 dark:text-gray-600'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-primary/10 shadow-sm' : ''}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </Link>
                        );
                    })}

                    {/* Burger Menu Toggle (Always Last in RTL visual flow) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`flex flex-col items-center justify-center transition-all ${isMenuOpen ? 'text-primary scale-110' : 'text-gray-400 dark:text-gray-600'}`}
                    >
                        <div className={`p-2.5 rounded-2xl transition-all ${isMenuOpen ? 'bg-primary/10 shadow-sm' : ''}`}>
                            <Menu className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            </nav>
        </>
    );
}
