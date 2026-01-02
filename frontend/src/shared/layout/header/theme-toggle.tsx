import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    className?: string;
    iconClassName?: string;
    invertedFloating?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, iconClassName, invertedFloating }) => {
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    };

    const getBackgroundClass = () => {
        if (!invertedFloating) return className || "cursor-pointer relative w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors";

        // Inverted Floating logic:
        // Current: Light -> Background: Dark (Night)
        // Current: Dark -> Background: Light (Day) + Glow
        return theme === 'light'
            ? "bg-gray-900 border-gray-800 shadow-2xl"
            : "bg-white border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.4)]";
    };

    return (
        <div
            onClick={toggleTheme}
            onKeyDown={handleKeyDown}
            className={`${invertedFloating ? 'w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto border' : (className || "cursor-pointer relative w-10 h-10 rounded-full flex items-center justify-center transition-all")} ${getBackgroundClass()}`}
            role="button"
            tabIndex={0}
            aria-label="Toggle Dark Mode"
            title={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع المضيء'}
        >
            <div className={`relative flex items-center justify-center pointer-events-none ${iconClassName || 'w-5 h-5'}`}>
                <Sun
                    className={`absolute transition-all duration-500 transform ${theme === 'light' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-yellow-500'} w-full h-full`}
                />
                <Moon
                    className={`absolute transition-all duration-500 transform ${theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-gray-400'} w-full h-full`}
                />
            </div>
        </div>
    );
};
