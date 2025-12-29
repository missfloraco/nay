import React from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
    hint?: string;
}

const Radio: React.FC<RadioProps> = ({
    label,
    error,
    hint,
    className = '',
    id,
    checked,
    ...props
}) => {
    const radioId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label
                htmlFor={radioId}
                className="group flex items-center gap-4 cursor-pointer select-none"
            >
                <div className="relative">
                    <input
                        type="radio"
                        id={radioId}
                        className="peer sr-only"
                        checked={checked}
                        {...props}
                    />
                    {/* Custom Radio Circle */}
                    <div className={`
                        w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                        ${checked
                            ? 'bg-white dark:bg-dark-900 border-primary shadow-lg shadow-primary/20'
                            : 'bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20'}
                        peer-focus:ring-[6px] peer-focus:ring-primary/5
                        ${error ? 'border-red-500' : ''}
                    `}>
                        <div className={`
                            w-2.5 h-2.5 rounded-full bg-primary transition-all duration-300
                            ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
                        `} />
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                        {label}
                    </span>
                    {hint && !error && (
                        <span className="text-[10px] text-gray-400 font-bold">{hint}</span>
                    )}
                </div>
            </label>

            {error && (
                <p className="text-[10px] text-red-500 font-black px-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Radio;
