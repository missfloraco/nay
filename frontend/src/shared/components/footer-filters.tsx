import React from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Filter } from 'lucide-react';

export interface FilterOption {
    id: string;
    label: string;
    icon?: LucideIcon;
    color?: string; // Tailwind class for icon color
    count?: number;
}

interface FooterFiltersProps {
    options: FilterOption[];
    activeValue: string;
    onChange: (value: string) => void;
    title?: string;
    variant?: 'pills' | 'sheets';
}

export const FooterFilters: React.FC<FooterFiltersProps> = ({
    options,
    activeValue,
    onChange,
    title = 'تصفية البيانات', // Kept in props interface for compatibility, but ignored in UI
    variant = 'pills'
}) => {
    const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const showScrollButtons = options.length > 5;

    React.useEffect(() => {
        setPortalTarget(document.getElementById('table-pagination-portal'));
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!portalTarget) return null;

    const content = (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Scroll Button (Right/Next in RTL context) */}
            {showScrollButtons && (
                <button
                    onClick={() => scroll('left')} // In RTL, negative scroll moves towards logic start (Right)
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hidden sm:flex"
                >
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
            )}

            {/* Filter Items Container */}
            <div
                ref={scrollContainerRef}
                className={`flex items-center no-scrollbar max-w-[600px] overflow-x-auto scroll-smooth ${variant === 'sheets' ? 'gap-1' : 'gap-2'}`}
            >
                {options.map((option) => {
                    const isActive = activeValue === option.id;
                    const Icon = option.icon;

                    if (variant === 'sheets') {
                        return (
                            <button
                                key={option.id}
                                onClick={() => onChange(option.id)}
                                className={`flex items-center gap-2 px-6 py-3.5 transition-all font-bold text-sm whitespace-nowrap relative group shrink-0 rounded-t-2xl
                                ${isActive
                                        ? 'bg-white/50 dark:bg-dark-800 text-primary z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:bg-primary before:rounded-t-lg shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />}
                                <span>{option.label}</span>
                                {option.count !== undefined && (
                                    <span className={`mr-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                        {option.count}
                                    </span>
                                )}
                            </button>
                        );
                    }

                    // Default Pills Variant
                    return (
                        <button
                            key={option.id}
                            onClick={() => onChange(option.id)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all font-bold text-sm whitespace-nowrap border shrink-0 ${isActive
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-dark-700'
                                }`}
                        >
                            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : option.color || 'text-gray-400'}`} />}
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                                <span className={`mr-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {option.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scroll Button (Left/Prev in RTL context) */}
            {showScrollButtons && (
                <button
                    onClick={() => scroll('right')} // In RTL, positive scroll moves towards logic end (Left)
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hidden sm:flex"
                >
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
            )}
        </div>
    );

    return createPortal(content, portalTarget);
};
