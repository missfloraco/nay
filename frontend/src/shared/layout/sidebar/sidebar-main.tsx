import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '@/shared/contexts/app-context';
import AdSlot from '@/shared/ads/adslot';

interface NavItem {
    icon?: any;
    label: string;
    path?: string;
    color?: string;
    badge?: number;
    isHeader?: boolean;
}

interface MainSidebarProps {
    items: NavItem[];
    secondaryItems?: NavItem[];
    homePath: string;
    className?: string;
    hideBranding?: boolean;
    hideFooter?: boolean;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
    items,
    secondaryItems = [],
    homePath,
    className = '',
    hideBranding = false,
    hideFooter = false
}) => {
    const { settings } = useSettings();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const renderNavItem = (item: NavItem, index: number) => {
        // Filter out headers for a cleaner list as requested
        if (item.isHeader) {
            if (isCollapsed) return <div key={`header-${index}`} className="h-4" />;
            return (
                <div key={`header-${index}`} className="px-4 pt-6 pb-2 mt-2 first:mt-0">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
                        {item.label}
                    </span>
                </div>
            );
        }

        const isActive = location.pathname.startsWith(item.path!);
        return (
            <Link
                key={item.path}
                to={item.path!}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-4'} py-2.5 rounded-xl transition-all font-bold ${isActive
                    ? 'bg-primary text-white shadow-lg active-nav-item'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white shadow-none'
                    }`}
            >
                {/* Icon Wrapper */}
                <div className={`flex items-center justify-center w-6 h-6 transition-all ${isActive ? 'text-white' : item.color || 'text-gray-500'}`}>
                    {item.icon && <item.icon className="w-5 h-5" />}
                </div>

                {!isCollapsed && <span className="text-sm flex-1">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`bg-red-500 text-white text-[10px] rounded-full px-1 min-w-[18px] h-4.5 flex items-center justify-center ${isActive ? 'bg-white text-primary' : ''}`}>
                        {item.badge > 9 ? '9+' : item.badge}
                    </span>
                )}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </Link>
        );
    };

    return (
        <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-[80px]' : 'w-[250px]'} h-full border-l border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-900 z-40 shrink-0 overflow-hidden transition-[width] duration-300 ${className}`}>
            {/* Logo Section */}
            {!hideBranding && (
                <div className={`h-[90px] flex items-center shrink-0 border-b border-gray-100 dark:border-white/5 ${isCollapsed ? 'justify-center px-0' : 'px-8'}`}>
                    <Link to={homePath} className="flex items-center gap-4 transition-all duration-300 hover:opacity-80 active:scale-95 group overflow-hidden">
                        <div className="flex items-center gap-3 truncate">
                            {(settings.systemLogoUrl || settings.logoUrl) && (
                                <img src={settings.systemLogoUrl || settings.logoUrl || ''} alt={settings.appName || ''} className="h-9 w-auto max-w-[120px] object-contain logo-img" />
                            )}
                            {!isCollapsed && (
                                <span className="text-sm lg:text-lg font-black text-gray-900 dark:text-white truncate block app-name-text">
                                    {settings.appName}
                                </span>
                            )}
                        </div>
                    </Link>
                </div>
            )}

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5">
                {items.map((item, index) => renderNavItem(item, index))}
            </nav>

            {/* Secondary Navigation Section (Bottom) */}
            {secondaryItems.length > 0 && (
                <nav className="shrink-0 p-3 space-y-1.5 border-t border-gray-100 dark:border-white/5">
                    {secondaryItems.map((item, index) => renderNavItem(item, index))}
                </nav>
            )}

            {/* Collapse Toggle */}
            <div className="shrink-0 p-3 border-t border-gray-100 dark:border-white/5 flex justify-center bg-gray-50/50 dark:bg-white/5">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                    {isCollapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    ) : (
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            <span className="text-xs font-bold">طي القائمة</span>
                        </div>
                    )}
                </button>
            </div>

            {/* Sidebar Ad Slot */}
            {!isCollapsed && (
                <div className="w-full shrink-0 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-dark-900">
                    <AdSlot placement="ad_sidebar" className="w-full aspect-[250/250]" showPlaceholder={false} />
                </div>
            )}
        </aside>
    );
};
