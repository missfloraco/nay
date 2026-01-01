import React from 'react';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ToolbarOption {
    id: string;
    label: string;
    icon?: LucideIcon;
    color?: string; // Tailwind class for icon color
    count?: number;
}

interface ToolbarProps {
    options: ToolbarOption[];
    activeValue: string;
    onChange: (value: string) => void;
    title?: string;
    variant?: 'pills' | 'sheets';
}

export const Toolbar: React.FC<ToolbarProps> = ({
    options,
    activeValue,
    onChange,
    title = 'تصفية البيانات', // Kept for compatibility
    variant = 'pills'
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const showScrollButtons = options.length > 5;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
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
                className={`flex items-center no-scrollbar w-full overflow-x-auto scroll-smooth ${variant === 'sheets' ? 'gap-1' : 'gap-2'}`}
            >
                {options.map((option) => {
                    const isActive = activeValue === option.id;
                    const Icon = option.icon;

                    if (variant === 'sheets') {
                        return (
                            <button
                                key={option.id}
                                onClick={() => onChange(option.id)}
                                className={`flex items-center gap-4 px-4 py-2.5 transition-all font-bold text-sm whitespace-nowrap relative group shrink-0 rounded-xl
                                ${isActive
                                        ? 'bg-primary text-white shadow-lg z-10'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
                                <span>{option.label}</span>
                                {option.count !== undefined && (
                                    <span className={`mr-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {option.count}
                                    </span>
                                )}
                            </button>
                        );
                    }

                    // Default Pills Variant (Unified Style)
                    return (
                        <button
                            key={option.id}
                            onClick={() => onChange(option.id)}
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all font-bold text-sm whitespace-nowrap shrink-0 ${isActive
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-100'
                                }`}
                        >
                            {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-white' : option.color || 'text-gray-500'}`} />}
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
};
