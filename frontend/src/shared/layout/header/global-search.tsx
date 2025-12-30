import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, User as UserIcon, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/shared/contexts/search-context';
import { useText } from '@/shared/contexts/text-context';
import { BASE_URL } from '@/shared/services/api';

export const GlobalSearch: React.FC = () => {
    const { searchQuery, setSearchQuery, results, isSearching, clearSearch } = useSearch();
    const { t } = useText();
    const navigate = useNavigate();

    const [showResults, setShowResults] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // keyboard shortcut: "/" or "Ctrl+K"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                setIsSearchVisible(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setShowResults(false);
                setIsSearchVisible(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputRef]);

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                if (window.innerWidth < 768) setIsSearchVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsSearchVisible, setShowResults]);

    return (
        <div
            ref={searchRef}
            className={`relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-full max-w-md border transition-all shadow-sm ${showResults ? 'border-primary ring-2 ring-primary/10 bg-white dark:bg-gray-900' : 'border-transparent'}`}
        >
            <Search className={`w-4 h-4 ms-2 transition-colors ${showResults ? 'text-primary' : 'text-gray-400'}`} />
            <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setShowResults(true)}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                }}
                placeholder={t('common.search', 'بحث ...')}
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-start"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin me-2" />}

            {/* Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-700 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto no-scrollbar z-50">
                    {results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((res) => (
                                <button
                                    key={`${res.type}-${res.id}`}
                                    onClick={() => {
                                        navigate(res.url);
                                        setShowResults(false);
                                        clearSearch();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-start"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-dark-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-dark-700">
                                        {res.image ? (
                                            <img src={res.image.startsWith('/uploads') ? `${BASE_URL}${res.image}` : res.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="text-primary opacity-60">
                                                {res.type === 'tenant' ? <Building2 className="w-5 h-5" /> :
                                                    <UserIcon className="w-5 h-5" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{res.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate">{res.subtitle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : !isSearching ? (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-400 font-bold">لا توجد نتائج لـ "{searchQuery}"</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
