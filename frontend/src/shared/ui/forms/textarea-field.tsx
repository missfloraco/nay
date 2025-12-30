import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    success?: boolean;
    hint?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(({
    label,
    icon: Icon,
    error,
    success,
    hint,
    className = '',
    id,
    ...props
}, ref) => {
    const textareaId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-2.5 group w-full">
            <div className="flex justify-between items-end px-1">
                <label
                    htmlFor={textareaId}
                    className="form-label group-focus-within:text-primary"
                >
                    {label}
                </label>
                {success && !error && (
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in-95">
                        تم الحفظ
                    </span>
                )}
            </div>

            <div className="relative">
                {Icon && (
                    <div className={`
                        absolute top-6 transition-all duration-500 z-10 pointer-events-none
                        start-6
                        ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-gray-300 group-focus-within:text-primary group-focus-within:scale-110'}
                    `}>
                        <Icon size={18} />
                    </div>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`
                        textarea-field
                        ${Icon ? 'ps-16' : ''} 
                        ${error ? 'error' : success ? 'success' : ''} 
                        ${className}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                    {...props}
                />
            </div>

            {error ? (
                <p
                    id={`${textareaId}-error`}
                    className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1"
                >
                    {error}
                </p>
            ) : hint ? (
                <p
                    id={`${textareaId}-hint`}
                    className="text-[10px] text-gray-400 font-bold px-2"
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
});

export default TextareaField;
