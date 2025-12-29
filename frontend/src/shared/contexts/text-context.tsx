import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import { DEFAULT_TEXTS } from '../locales/defaults';
import { logger } from '../services/logger';

// Fallback texts in case API fails (Importing just one important set or keeping it minimal)
// Ideally, we might want to import the existing structures as fallback, 
// but circular dependencies might occur if we are not careful.
// For now, valid empty state is supported.

interface TextContextType {
    texts: any;
    loading: boolean;
    error: string | null;
    t: (path: string, defaultVal?: string) => string;
    refreshTexts: () => Promise<void>;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [texts, setTexts] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTexts = async (retryCount = 0) => {
        try {
            // Always fetch Arabic texts
            const response = await api.get('/public/texts/ar');
            if (response) {
                setTexts(response);
            }
            setError(null);
        } catch (err) {
            logger.error(`Silent text fetch failed (attempt ${retryCount + 1})`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTexts();
    }, []);

    const t = (path: string, defaultVal: string = ''): string => {
        // 1. Try to find in loaded texts (API)
        let current = texts;
        if (current && typeof current === 'object') {
            const keys = path.split('.');
            let found = true;
            for (const key of keys) {
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    found = false;
                    break;
                }
            }
            if (found && typeof current === 'string') return current;
        }

        // 2. Try to find in DEFAULT_TEXTS (Local Defaults - PRIMARY FALLBACK)
        let fallback: any = DEFAULT_TEXTS;
        const keys = path.split('.');
        let foundFallback = true;
        for (const key of keys) {
            if (fallback && typeof fallback === 'object' && key in fallback) {
                fallback = fallback[key];
            } else {
                foundFallback = false;
                break;
            }
        }
        if (foundFallback && typeof fallback === 'string') return fallback;

        // 3. Return provided defaultVal or simple key path
        return defaultVal || path;
    };

    const value = {
        texts,
        loading,
        error,
        t,
        refreshTexts: fetchTexts
    };

    return (
        <TextContext.Provider value={value}>
            {children}
        </TextContext.Provider>
    );
};

export const useText = () => {
    const context = useContext(TextContext);
    if (context === undefined) {
        throw new Error('useText must be used within a TextProvider');
    }
    return context;
};
