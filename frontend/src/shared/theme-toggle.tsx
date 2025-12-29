import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';

export default function ThemeToggle() {
    const { darkMode, toggleTheme } = useSettings();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
