import React from 'react';
import { LucideIcon, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    success?: boolean;
    hint?: string;
    options: { value: string; label: string }[];
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(({
    label,
    icon: Icon,
    error,
    success,
    hint,
    options,
    className = '',
    id,
    ...props
}, ref) => {
    const selectId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-2.5 group w-full">
            <div className="flex justify-between items-center px-1">
                <label
                    htmlFor={selectId}
                    className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-primary'}`}
                >
                    {label}
                </label>
                {success && !error && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95">
                        <CheckCircle2 size={12} className="inline-block me-1" />
                        تم الاختيار
                    </span>
                )}
            </div>

            <div className="relative group/field transition-all duration-300">
                {Icon && (
                    <div className={`
                        absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-10 pointer-events-none
                        start-5
                        ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-gray-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:rotate-3'}
                    `}>
                        <Icon size={19} strokeWidth={2.5} />
                    </div>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    className={`
                        w-full h-16 bg-gray-50/50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 px-6 text-[15px] font-bold outline-none transition-all duration-500 text-start appearance-none
                        ps-14 pe-14
                        ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5 bg-red-50/10' : ''} 
                        ${success ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/5 bg-emerald-50/10' : ''} 
                        ${className}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 font-bold">
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* End Aligned Arrow (for Select) - Standard for RTL visual left */}
                <div className="absolute end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <ChevronDown size={20} />
                </div>
            </div>

            {error ? (
                <p
                    id={`${selectId}-error`}
                    className="text-[11px] text-red-500 font-black px-4 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-300"
                >
                    <AlertCircle size={12} />
                    {error}
                </p>
            ) : hint ? (
                <p
                    id={`${selectId}-hint`}
                    className="text-[11px] text-gray-400 dark:text-gray-600 font-bold px-4"
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
});

export default SelectField;
