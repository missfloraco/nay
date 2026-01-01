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
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 select-none gap-4";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-lg shadow-primary/25 hover:shadow-primary/40",
        secondary: "bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 focus:ring-gray-100 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:text-gray-900 dark:hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/50 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
        ghost: "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5"
    };

    const sizes = {
        sm: "px-3.5 py-2 text-[10px]",
        md: "px-4 py-3 text-sm",
        lg: "px-8 py-4.5 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
            ) : Icon ? (
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
            ) : null}
            <span className="relative">{children}</span>
        </button>
    );
};

export default Button;
