import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    success?: boolean;
    hint?: string;
    endContent?: React.ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
    label,
    icon: Icon,
    error,
    success,
    hint,
    endContent,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-2.5 group w-full">
            <div className="flex justify-between items-end px-1">
                <label
                    htmlFor={inputId}
                    className="form-label group-focus-within:text-primary"
                >
                    {label}
                </label>
                {success && !error && (
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95">
                        تم التحقق
                    </span>
                )}
            </div>

            <div className="relative">
                {Icon && (
                    <div className={`
                        absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-10 pointer-events-none
                        end-6
                        ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-gray-300 group-focus-within:text-primary group-focus-within:scale-110'}
                    `}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        input-field
                        ${Icon ? 'pe-16' : ''} 
                        ${error ? 'error' : success ? 'success' : ''} 
                        ${className}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {endContent && (
                    <div className="absolute top-1/2 -translate-y-1/2 end-6 z-20">
                        {endContent}
                    </div>
                )}
            </div>

            {error ? (
                // ...
                <p
                    id={`${inputId}-error`}
                    className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1"
                >
                    {error}
                </p>
            ) : hint ? (
                <p
                    id={`${inputId}-hint`}
                    className="text-[10px] text-gray-400 font-bold px-2"
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
});

export default InputField;
