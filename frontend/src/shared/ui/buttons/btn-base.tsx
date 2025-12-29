import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    className = '',
    disabled,
    ...props
}) => {
    // Legacy prop cleanup: Ensure 'loading' doesn't leak to DOM if passed via spread
    const { loading: _, ...rest } = props as any;
    const baseStyles = "inline-flex items-center justify-center rounded-2xl font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 uppercase tracking-wider select-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-lg shadow-primary/25 hover:shadow-primary/40",
        secondary: "bg-gray-100 dark:bg-dark-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700 focus:ring-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-dark-600",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/50 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
        ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5"
    };

    const sizes = {
        sm: "px-3.5 py-2 text-[10px]",
        md: "px-6 py-3.5 text-xs",
        lg: "px-8 py-4.5 text-sm"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? (
                <div className="flex items-center justify-center mr-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
            ) : Icon ? (
                <Icon className={`w-4 h-4 ${children ? 'ml-2' : ''} transition-transform group-hover:scale-110`} />
            ) : null}
            <span className="relative">{children}</span>
        </button>
    );
};

export default Button;
