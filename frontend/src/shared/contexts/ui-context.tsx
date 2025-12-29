import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UIContextType {
    sidebarOpen: boolean;
    darkMode: boolean;
    toggleSidebar: () => void;
    toggleDarkMode: () => void;
}

export const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <UIContext.Provider value={{ sidebarOpen, darkMode, toggleSidebar, toggleDarkMode }}>
            {children}
        </UIContext.Provider>
    );
};
