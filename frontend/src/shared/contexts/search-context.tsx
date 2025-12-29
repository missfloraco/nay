import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SearchService, SearchResult } from '@/shared/services/searchservice';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { logger } from '@/shared/services/logger';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    results: SearchResult[];
    isSearching: boolean;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const queryClient = useQueryClient();
    const debouncedQuery = useDebounce(searchQuery, 300);

    const clearSearch = () => {
        setSearchQuery('');
        setResults([]);
    };

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        const performSearch = async () => {
            setIsSearching(true);
            try {
                // FALLBACK TO OPTIMIZED DB QUERIES (Background fetch)
                const serverResults = await SearchService.globalSearch(debouncedQuery);
                setResults(serverResults);
            } catch (error) {
                logger.error('Global Search Error', error);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedQuery, queryClient]);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, results, isSearching, clearSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
