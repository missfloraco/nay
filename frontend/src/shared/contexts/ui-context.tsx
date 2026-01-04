import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UIContextType {
    isRightDrawerOpen: boolean;
    isLeftDrawerOpen: boolean;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    openRightDrawer: () => void;
    openLeftDrawer: () => void;
    closeDrawers: () => void;
    toggleRightDrawer: () => void;
    toggleLeftDrawer: () => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

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
        setIsMobileMenuOpen(false);
    };

    const toggleRightDrawer = () => {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(!isRightDrawerOpen);
    };

    const toggleLeftDrawer = () => {
        setIsRightDrawerOpen(false);
        setIsLeftDrawerOpen(!isLeftDrawerOpen);
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const setSidebarCollapsed = (collapsed: boolean) => setIsSidebarCollapsed(collapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <UIContext.Provider value={{
            isRightDrawerOpen,
            isLeftDrawerOpen,
            isSidebarCollapsed,
            isMobileMenuOpen,
            openRightDrawer,
            openLeftDrawer,
            closeDrawers,
            toggleRightDrawer,
            toggleLeftDrawer,
            toggleSidebar,
            setSidebarCollapsed,
            toggleMobileMenu,
            closeMobileMenu,
            darkMode,
            toggleDarkMode
        }}>
            {children}
        </UIContext.Provider>
    );
};
