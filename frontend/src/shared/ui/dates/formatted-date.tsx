import React from 'react';
import { formatDate } from '@/shared/utils/helpers';

interface FormattedDateProps {
    value: Date | string | null;
    className?: string;
}

export const FormattedDate: React.FC<FormattedDateProps> = ({
    value,
    className
}) => {
    if (!value) return <span className={className}>-</span>;

    // Always use Western numerals: 30/12/2025
    const formatted = formatDate(value);

    return <span className={className}>{formatted}</span>;
};
