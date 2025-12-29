import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
    id: string | number;
    label: string;
    icon?: LucideIcon;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string | number;
    onChange: (id: any) => void;
    variant?: 'standard' | 'pill' | 'minimal';
    className?: string;
}

/**
 * Tabs component redesigned to match sidebar button style
 * Provides consistent UI across filter sections
 */
const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`flex gap-2 ${className.includes('flex-row') ? '' : 'flex-col'} ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group
                            ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {Icon && (
                            <Icon
                                className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                                    }`}
                            />
                        )}
                        <span className="flex-1 text-right">{tab.label}</span>

                        {tab.count !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {tab.count}
                            </span>
                        )}

                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
