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
    className?: string; // Allow custom classes
}

export const Toolbar: React.FC<ToolbarProps> = ({
    options,
    activeValue,
    onChange,
    title = 'تصفية البيانات', // Kept for compatibility
    variant = 'pills',
    className
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);

    const checkOverflow = React.useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollWidth > clientWidth);
        }
    }, []);

    React.useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [checkOverflow, options]);

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
        <div className={`flex items-center gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${className || ''}`}>

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
                                className={`flex items-center gap-4 px-4 py-2.5 transition-all font-bold text-sm whitespace-nowrap relative group shrink-0 rounded-2xl
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
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all font-bold text-sm whitespace-nowrap shrink-0 ${isActive
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

            {/* Scroll Button (Left/Prev in RTL context) - Only shows if overflow exists */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('right')} // In RTL, positive scroll moves towards logic end (Left)
                    className="flex items-center justify-center p-2.5 rounded-2xl transition-all font-bold text-sm shrink-0 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-100"
                >
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
            )}
        </div>
    );
};
