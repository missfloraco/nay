import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
    icon?: any;
    label: string;
    path?: string;
    color?: string;
    badge?: number;
    isHeader?: boolean;
}

interface MobileNavLinksProps {
    items: NavItem[];
    onClose: () => void;
}

export const MobileNavLinks: React.FC<MobileNavLinksProps> = ({ items, onClose }) => {
    const location = useLocation();

    return (
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
            {items.map((item, index) => {
                if (item.isHeader) {
                    return (
                        <div key={`header-${index}`} className="px-4 pt-6 pb-2 mt-4 first:mt-0">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                {item.label}
                            </span>
                        </div>
                    );
                }

                if (!item.path) return null;

                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`
                            flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold group
                            ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'}
                        `}
                    >
                        <div className={`p-0.5 transition-colors ${isActive ? 'text-white' : (item.color || 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300')}`}>
                            {Icon && <Icon className="w-5 h-5" />}
                        </div>
                        <span className="text-sm flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className={`
                                text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1
                                ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white shadow-sm'}
                            `}>
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};
