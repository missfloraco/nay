import React from 'react';

interface FormattedNumberProps {
    value: number | string;
    className?: string;
    withCommas?: boolean;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({
    value,
    className,
    withCommas = false
}) => {
    const formatted = withCommas
        ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : value.toString();

    return <span className={className}>{formatted}</span>;
};
