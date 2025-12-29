import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2.5 group">
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] px-2">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-110">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`w-full bg-white dark:bg-dark-900/50 border border-gray-200 dark:border-dark-800 rounded-xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:ring-[6px] focus:ring-primary/5 focus:border-primary outline-none transition-all duration-500 shadow-sm hover:border-gray-300 dark:hover:border-dark-700 ${Icon ? 'pl-14' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/5' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export default InputField;
