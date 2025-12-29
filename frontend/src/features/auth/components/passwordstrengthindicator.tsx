import React from 'react';
import { useText } from '@/shared/contexts/text-context';

interface PasswordStrengthIndicatorProps {
    strength: 'weak' | 'medium' | 'strong';
    passwordLength: number;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength, passwordLength }) => {
    const { t } = useText();

    if (passwordLength === 0) return null;

    return (
        <div className="pt-3 px-1 animate-in fade-in duration-300">
            <div className="flex gap-2 mb-2.5">
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${strength === 'weak' ? 'bg-accent2' : strength === 'medium' ? 'bg-secondary' : 'bg-accent1'}`} />
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${strength === 'medium' ? 'bg-secondary' : strength === 'strong' ? 'bg-accent1' : 'bg-gray-200 dark:bg-dark-800'}`} />
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${strength === 'strong' ? 'bg-accent1' : 'bg-gray-200 dark:bg-dark-800'}`} />
            </div>
            <span className={`text-xs font-bold ${strength === 'weak' ? 'text-accent2' : strength === 'medium' ? 'text-secondary' : 'text-accent1'}`}>
                {t(`AUTH.REGISTER.STRENGTH.${strength.toUpperCase()}`)}
            </span>
        </div>
    );
};
