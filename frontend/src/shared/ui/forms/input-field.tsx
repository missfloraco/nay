import React from 'react';
import { LucideIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    labelExtras?: React.ReactNode;
    icon?: LucideIcon;
    error?: string;
    success?: boolean;
    hint?: string;
    endContent?: React.ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
    label,
    labelExtras,
    icon: Icon,
    error,
    success,
    hint,
    endContent,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || (label || 'input').replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-2.5 group w-full relative">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor={inputId}
                        className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-primary'}`}
                    >
                        {label}
                    </label>
                    {labelExtras}
                </div>
                {success && !error && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95">
                        <CheckCircle2 size={12} className="inline-block me-1" />
                        تم التحقق
                    </span>
                )}
            </div>

            <div className="relative group/field transition-all duration-300">
                {/* Right Aligned Icon */}
                <div className={`absolute top-1/2 -translate-y-1/2 transition-transform duration-500 group-focus-within:scale-110 group-focus-within:rotate-3 
                    ${Icon ? 'end-6 text-gray-400 group-focus-within:text-primary' : 'hidden'}`}>
                    {Icon && <Icon size={20} />}
                </div>

                {/* Left Aligned End Content */}
                <div className="absolute start-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {endContent}
                </div>
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full h-16 bg-gray-50/50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 px-6 text-[15px] font-bold outline-none transition-all duration-500 text-start
                        placeholder:text-gray-300 dark:placeholder:text-gray-600 rounded-[1.25rem]
                        hover:bg-white dark:hover:bg-dark-800 hover:border-gray-200 dark:hover:border-white/10
                        focus:bg-white dark:focus:bg-dark-800 focus:border-primary focus:shadow-[0_0_0_1px_var(--primary)] focus:ring-8 focus:ring-primary/5
                        ${Icon ? 'pe-14' : ''} 
                        ${endContent ? 'ps-14' : ''}
                        ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5 bg-red-50/10' : ''} 
                        ${success ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/5 bg-emerald-50/10' : ''} 
                        ${className}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
            </div>

            {error ? (
                <p
                    id={`${inputId}-error`}
                    className="text-[11px] text-red-500 font-black px-4 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-300"
                >
                    <AlertCircle size={12} />
                    {error}
                </p>
            ) : hint ? (
                <p
                    id={`${inputId}-hint`}
                    className="text-[11px] text-gray-400 dark:text-gray-600 font-bold px-4"
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
});

export default InputField;
