import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-3 group">
            {label && (
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-6 top-6 text-gray-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <textarea
                    className={`w-full bg-slate-50/50 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-5 text-[15px] font-bold outline-none transition-all duration-300 resize-none hover:bg-white dark:hover:bg-dark-800/60 focus:bg-white dark:focus:bg-dark-800 focus:border-primary/20 focus:ring-[8px] focus:ring-primary/5 focus:shadow-[0_10px_25px_rgba(var(--primary-rgb),0.05)] ${Icon ? 'pl-14' : ''} ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/5' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-500/80 font-bold px-1">{error}</p>}
        </div>
    );
};

export default TextareaField;
