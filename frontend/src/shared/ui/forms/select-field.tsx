import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

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
            <div className="flex justify-between items-end px-1">
                <label
                    htmlFor={selectId}
                    className="form-label group-focus-within:text-primary"
                >
                    {label}
                </label>
                {success && !error && (
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95">
                        تم الاختيار
                    </span>
                )}
            </div>

            <div className="relative">
                {Icon && (
                    <div className={`
                        absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-10 pointer-events-none
                        start-6
                        ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-gray-300 group-focus-within:text-primary group-focus-within:scale-110'}
                    `}>
                        <Icon size={18} />
                    </div>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    className={`
                        select-field
                        pe-16
                        ${Icon ? 'ps-16' : 'ps-6'} 
                        ${error ? 'error' : success ? 'success' : ''} 
                        ${className}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100">
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors end-6">
                    <ChevronDown size={18} strokeWidth={3} />
                </div>
            </div>

            {error ? (
                <p
                    id={`${selectId}-error`}
                    className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1"
                >
                    {error}
                </p>
            ) : hint ? (
                <p
                    id={`${selectId}-hint`}
                    className="text-[10px] text-gray-400 font-bold px-2"
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
});

export default SelectField;
