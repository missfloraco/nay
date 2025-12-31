import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '@/shared/contexts/app-context';

interface NavItem {
    icon: any;
    label: string;
    path: string;
    color?: string;
    badge?: number;
}

interface MainSidebarProps {
    items: NavItem[];
    homePath: string;
    className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ items, homePath, className = '' }) => {
    const { settings } = useSettings();
    const location = useLocation();

    return (
        <aside className={`hidden lg:flex flex-col w-[250px] h-full border-l border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 z-40 shrink-0 overflow-hidden ${className}`}>
            {/* Logo Section */}
            <div className="h-[90px] flex items-center shrink-0 border-b border-gray-100 dark:border-white/5 px-8">
                <Link to={homePath} className="flex items-center gap-4 transition-all duration-300 hover:opacity-80 active:scale-95 group overflow-hidden">
                    <div className="flex items-center gap-3 truncate">
                        {(settings.systemLogoUrl || settings.logoUrl) && (
                            <img src={settings.systemLogoUrl || settings.logoUrl || ''} alt={settings.appName || ''} className="h-9 w-auto max-w-[120px] object-contain logo-img" />
                        )}
                        <span className="text-sm lg:text-lg font-black text-gray-900 dark:text-white truncate block app-name-text">
                            {settings.appName}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-1.5">
                {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${isActive
                                ? 'bg-primary text-white shadow-lg active-nav-item'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white shadow-none'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-all scale-110 ${isActive ? '' : item.color || ''}`} />
                            <span className="text-sm flex-1">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`bg-red-500 text-white text-[10px] rounded-full px-1 min-w-[18px] h-4.5 flex items-center justify-center ${isActive ? 'bg-white text-primary' : ''}`}>
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Copyright Section */}
            <div className="mt-auto border-t border-gray-200 dark:border-dark-700 h-[90px] px-8 flex flex-col justify-center items-start text-right shrink-0">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 opacity-80 leading-none">جميع الحقوق محفوظة</span>
                <span className="text-xs font-black text-gray-700 dark:text-gray-400 leading-relaxed">
                    منصة {settings?.appName || 'النظام'} © {new Date().getFullYear()}
                    {settings?.companyName && (
                        <span className="block mt-1 text-[10px] opacity-70">
                            أحد مشاريع شركة {settings.companyName}
                        </span>
                    )}
                </span>
            </div>
        </aside>
    );
};
