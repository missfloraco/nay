import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, User as UserIcon, Building2, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/shared/contexts/search-context';
import { useText } from '@/shared/contexts/text-context';
import { BASE_URL } from '@/shared/services/api';

interface GlobalSearchProps {
    variant?: 'header-center' | 'header-left';
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ variant = 'header-center' }) => {
    const { searchQuery, setSearchQuery, results, isSearching, clearSearch } = useSearch();
    const { t } = useText();
    const navigate = useNavigate();

    const [showResults, setShowResults] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: "/" or "Ctrl+K"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                setIsOverlayOpen(true);
            }
            if (e.key === 'Escape') {
                setShowResults(false);
                setIsOverlayOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOverlayOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOverlayOpen]);

    // Close results on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (url: string) => {
        navigate(url);
        setShowResults(false);
        setIsOverlayOpen(false);
        clearSearch();
    };

    // 1. Mobile Search Trigger (Icon only)
    if (variant === 'header-left') {
        return (
            <>
                <button
                    onClick={() => setIsOverlayOpen(true)}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all active:scale-95"
                    aria-label={t('common.search', 'بحث')}
                    aria-haspopup="true"
                    aria-expanded={isOverlayOpen}
                >
                    <Search size={20} className="w-5 h-5 transition-transform hover:scale-110" />
                </button>

                {/* Mobile/Tablet Command Palette Modal */}
                {isOverlayOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300"
                            onClick={() => setIsOverlayOpen(false)}
                        />

                        {/* Search Window (Command Palette) */}
                        <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_80px_-12px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-top-10 duration-300 mt-4 sm:mt-20">

                            {/* Search Box Header */}
                            <div className="relative flex items-center p-4 sm:p-6 border-b border-gray-100/50">
                                <Search className="absolute right-8 w-6 h-6 text-primary" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('common.search', 'ابحث عن مشترك، فاتورة، أو إعداد...')}
                                    className="w-full bg-gray-50 border-none outline-none text-base sm:text-lg font-bold text-gray-900 pr-12 pl-12 py-3 rounded-2xl transition-all focus:bg-white focus:ring-2 focus:ring-primary/10"
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-expanded={results.length > 0}
                                />
                                <div className="absolute left-10 flex items-center gap-2">
                                    {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                    {searchQuery && !isSearching && (
                                        <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-200 rounded-lg text-gray-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOverlayOpen(false)}
                                    className="mr-2 p-2 hover:bg-gray-100 rounded-xl text-gray-400 hidden sm:block"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Result Area */}
                            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-2 sm:p-4 bg-white">
                                {results.length > 0 ? (
                                    <div className="space-y-1">
                                        <div className="px-4 py-2 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.results', 'نتائج البحث')}</span>
                                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{results.length}</span>
                                        </div>
                                        {results.map((res) => (
                                            <button
                                                key={`${res.type}-${res.id}`}
                                                onClick={() => handleResultClick(res.url)}
                                                className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-all text-start group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden group-hover:border-primary/20">
                                                    {res.image ? (
                                                        <img src={res.image.startsWith('/uploads') ? `${BASE_URL}${res.image}` : res.image} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="text-primary opacity-60">
                                                            {res.type === 'tenant' ? <Building2 className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-black text-gray-900 truncate group-hover:text-primary transition-colors">{res.title}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold truncate">{res.subtitle}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                        <Search size={14} />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : searchQuery.length >= 2 && !isSearching ? (
                                    <div className="py-16 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <p className="text-lg font-black text-gray-900">{t('common.noResults', 'لا يوجد نتائج مطابقة')}</p>
                                        <p className="text-sm text-gray-400 font-bold mt-1">تأكد من كتابة الاسم بشكل صحيح أو حاول البحث عن كلمة أخرى</p>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <div className="py-12 px-6">
                                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <div className="p-2 bg-white rounded-xl text-primary shadow-sm">
                                                <Command size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-primary uppercase tracking-wider">{t('common.quickSearch', 'البحث السريع')}</p>
                                                <p className="text-sm font-bold text-gray-600 leading-tight">ابحث عن أسماء المشتركين، أرقام هواتفهم، أو حتى صفحات الإعدادات.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">اختصار سريع</p>
                                                <p className="text-sm font-bold text-gray-900">اضغط / للبحث</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">دقة البيانات</p>
                                                <p className="text-sm font-bold text-gray-900">نتائج مباشرة من النظام</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Footer / Shortcuts */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 hidden sm:flex">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-gray-600 font-mono">ESC</kbd> {t('common.toClose', 'للإغلاق')}</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-gray-600 font-mono">Enter</kbd> {t('common.toSelect', 'للاختيار')}</span>
                                </div>
                                <span className="flex items-center gap-1 text-primary/60">{t('common.systemSync', 'البيانات متزامنة مع النظام')}</span>
                            </div>

                            {/* Mobile Close Handle/Indicator */}
                            <div className="sm:hidden h-1 w-12 bg-gray-200 rounded-full mx-auto my-3" />
                        </div>
                    </div>
                )}
            </>
        );
    }

    // 2. Desktop Centered Search (Standard Input)
    return (
        <div
            ref={searchRef}
            className="relative w-full max-w-[500px] group global-search-centered"
            role="search"
        >
            <div className={`
                relative flex items-center gap-3 px-5 py-3 bg-gray-50 border transition-all duration-300 rounded-2xl
                ${showResults && searchQuery.length >= 2 ? 'border-primary shadow-xl bg-white' : 'border-transparent hover:bg-gray-100 focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5'}
            `}>
                <Search className={`w-5 h-5 transition-colors ${showResults || searchQuery ? 'text-primary' : 'text-gray-400'}`} />

                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                    }}
                    placeholder={t('common.search', 'بحث عن أي شيء...')}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 text-start"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showResults && results.length > 0}
                />


                {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin" />}

                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                        aria-label="مسح البحث"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Desktop Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-[450px] overflow-y-auto no-scrollbar z-50">
                    {results.length > 0 ? (
                        <div className="px-2 space-y-1">
                            {results.map((res) => (
                                <button
                                    key={`${res.type}-${res.id}`}
                                    onClick={() => handleResultClick(res.url)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-2xl transition-all text-start group/res"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 group-hover/res:border-primary/20 transition-colors">
                                        {res.image ? (
                                            <img src={res.image.startsWith('/uploads') ? `${BASE_URL}${res.image}` : res.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="text-primary opacity-60">
                                                {res.type === 'tenant' ? <Building2 size={20} /> : <UserIcon size={20} />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 group-hover/res:text-primary transition-colors truncate">{res.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate">{res.subtitle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : !isSearching ? (
                        <div className="px-6 py-10 text-center">
                            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400 font-black">لا توجد نتائج مطابقة لـ "{searchQuery}"</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};


