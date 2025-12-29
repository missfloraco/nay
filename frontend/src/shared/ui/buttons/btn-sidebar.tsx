import { LucideIcon } from 'lucide-react';

interface SidebarButtonProps {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    isActive?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}

/**
 * SidebarButton Component
 * 
 * A specialized button designed for use in the left sidebar
 * Used in left sidebar (leftSidebarContent) for filters, actions, and navigation
 * 
 * Features:
 */
export default function SidebarButton({
    label,
    icon: Icon,
    onClick,
    isActive = false,
    variant = 'primary',
    className = ''
}: SidebarButtonProps) {
    const baseStyles = 'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group';

    const variantStyles = {
        primary: isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white',
        secondary: isActive
            ? 'bg-secondary text-white shadow-lg shadow-secondary/30 scale-[1.02]'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white',
        danger: isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-red-600 dark:hover:text-red-400'
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        >
            {Icon && (
                <Icon
                    className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}
                />
            )}
            <span className="flex-1 text-right">{label}</span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </button>
    );
}
