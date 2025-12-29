import React from 'react';
import { formatDate } from '@/shared/utils/helpers';

interface DateTimeSeparatorProps {
    date: string | Date | null | undefined;
    includeTime?: boolean;
    className?: string;
}

const DateTimeSeparator: React.FC<DateTimeSeparatorProps> = ({ date, includeTime = false, className = '' }) => {
    if (!date) return <span className={className}>-</span>;

    const formatted = formatDate(date, includeTime);
    if (formatted === '-') return <span className={className}>-</span>;

    // Split by the separator we added in helpers.ts ( | )
    const parts = formatted.split(' | ');

    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            {parts.map((part, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="text-primary font-black opacity-30 select-none mx-0.5">|</span>
                    )}
                    <span>{part}</span>
                </React.Fragment>
            ))}
        </span>
    );
};

export default DateTimeSeparator;
