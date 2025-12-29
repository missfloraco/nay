import React, { useState, useEffect } from 'react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

interface Country {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
    currency_code: string;
    currency_name_ar: string;
    currency_symbol: string;
    is_default: boolean;
}

interface CountrySelectorProps {
    value?: number;
    onChange: (countryId: number, currencyCode: string) => void;
    className?: string;
}

export default function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const data = await api.get('/countries');
            setCountries(data);
        } catch (error) {
            logger.error('Failed to load countries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryId = parseInt(e.target.value);
        const country = countries.find(c => c.id === countryId);
        if (country) {
            onChange(countryId, country.currency_code);
        }
    };

    if (loading) {
        return (
            <select className={className} disabled>
                <option>جاري التحميل...</option>
            </select>
        );
    }

    return (
        <select
            value={value || countries.find(c => c.is_default)?.id}
            onChange={handleChange}
            className={className}
        >
            {countries.map(country => (
                <option key={country.id} value={country.id}>
                    {country.name_ar} ({country.currency_symbol})
                </option>
            ))}
        </select>
    );
}
