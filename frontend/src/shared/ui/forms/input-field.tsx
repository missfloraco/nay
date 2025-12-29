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
        <div className="space-y-2 group">
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`w-full bg-gray-50 dark:bg-dark-900 border-2 border-gray-100 dark:border-dark-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all duration-300 ${Icon ? 'pl-14' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/5' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
        </div>
    );
};

export default InputField;
