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
        <div className="space-y-3 group">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-primary">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-110 z-10 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full 
                        bg-slate-50/50 dark:bg-dark-900/40 
                        border border-slate-200 dark:border-white/5 
                        rounded-2xl 
                        px-6 py-4.5 
                        text-[15px] font-bold text-gray-900 dark:text-gray-100 
                        placeholder-gray-300 dark:placeholder-gray-600 
                        outline-none 
                        transition-all duration-500 
                        shadow-[0_2px_10px_rgba(0,0,0,0.02)]
                        hover:bg-white dark:hover:bg-dark-800/60
                        hover:border-slate-300 dark:hover:border-white/10
                        focus:bg-white dark:focus:bg-dark-800 
                        focus:border-primary 
                        focus:ring-[8px] focus:ring-primary/5 
                        focus:shadow-[0_10px_25px_rgba(var(--primary-rgb),0.05)]
                        ${Icon ? 'pl-16' : ''} 
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/5' : ''} 
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black px-2 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export default InputField;
