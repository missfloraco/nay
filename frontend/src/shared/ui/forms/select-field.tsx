import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    icon: Icon,
    error,
    options,
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
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none z-10">
                        <Icon size={18} />
                    </div>
                )}
                <select
                    className={`w-full bg-slate-50/50 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4.5 text-[15px] font-bold outline-none transition-all duration-300 appearance-none hover:bg-white dark:hover:bg-dark-800/60 focus:bg-white dark:focus:bg-dark-800 focus:border-primary/20 focus:ring-[8px] focus:ring-primary/5 focus:shadow-[0_10px_25px_rgba(var(--primary-rgb),0.05)] ${Icon ? 'pl-14' : ''} ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/5' : ''} ${className}`}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-900">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-[10px] text-red-500/80 font-bold px-1">{error}</p>}
        </div>
    );
};

export default SelectField;
