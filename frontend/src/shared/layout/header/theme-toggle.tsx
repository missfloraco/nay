import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Check local storage or system preference
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        } else {
            root.classList.remove('dark-mode');
            root.classList.add('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-100 transition-all active:scale-95 group shadow-sm hover:shadow-md"
            aria-label="Toggle Dark Mode"
            title={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع المضيء'}
        >
            <div className="relative w-5 h-5">
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-yellow-500'}`}
                />
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
                />
            </div>
        </button>
    );
};
