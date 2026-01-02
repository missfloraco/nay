import React from 'react';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useLocation } from 'react-router-dom';
import { useUI } from '@/shared/contexts/ui-context';
import { Menu, Bell, Search, Settings } from 'lucide-react';
import { GlobalSearch } from './global-search';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, actions }) => {
  const { toggleMobileMenu } = useUI();
  const { user: adminUser, logout: logoutAdmin } = useAdminAuth();
  const { user: appUser, logout: logoutApp } = useTenantAuth();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const currentUser = isAdmin ? adminUser : appUser;

  const handleLogout = async () => {
    if (isAdmin) {
      await logoutAdmin();
    } else {
      await logoutApp();
    }
  };

  return (
    <header className="h-[70px] lg:h-[90px] px-4 lg:px-8 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="p-2 lg:hidden rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-primary transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        {title && (
          <h1 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white truncate tracking-tight hidden md:block">
            {title}
          </h1>
        )}
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-xl mx-8 hidden lg:block">
        <GlobalSearch variant="header-center" />
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile Search Icon only */}
        <div className="lg:hidden">
          <GlobalSearch variant="header-left" />
        </div>

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <div className="h-6 w-px bg-gray-100 dark:bg-white/5 mx-1 hidden lg:block" />
      </div>
    </header>
  );
};
