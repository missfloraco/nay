import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UIContextType {
    isRightDrawerOpen: boolean;
    isLeftDrawerOpen: boolean;
    openRightDrawer: () => void;
    openLeftDrawer: () => void;
    closeDrawers: () => void;
    toggleRightDrawer: () => void;
    toggleLeftDrawer: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
    const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const openRightDrawer = () => {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(true);
    };

    const openLeftDrawer = () => {
        setIsRightDrawerOpen(false);
        setIsLeftDrawerOpen(true);
    };

    const closeDrawers = () => {
        setIsRightDrawerOpen(false);
        setIsLeftDrawerOpen(false);
    };

    const toggleRightDrawer = () => {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(!isRightDrawerOpen);
    };

    const toggleLeftDrawer = () => {
        setIsRightDrawerOpen(false);
        setIsLeftDrawerOpen(!isLeftDrawerOpen);
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <UIContext.Provider value={{
            isRightDrawerOpen,
            isLeftDrawerOpen,
            openRightDrawer,
            openLeftDrawer,
            closeDrawers,
            toggleRightDrawer,
            toggleLeftDrawer,
            darkMode,
            toggleDarkMode
        }}>
            {children}
        </UIContext.Provider>
    );
};
