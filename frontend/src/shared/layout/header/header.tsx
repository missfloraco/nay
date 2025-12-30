import React, { useState, useRef, useEffect } from 'react';
import { Menu, Power } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import ThemeToggle from '@/shared/theme-toggle';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';
// import { useSearch } from '@/shared/contexts/search-context'; /* moved to GlobalSearch */
// import { useUI } from '@/shared/contexts/ui-context'; /* unused */
import { Package, User as UserIcon, ShoppingBag, Truck, Tag, Loader2, Landmark, Wallet, Briefcase, FileText, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TrialBadge as OriginalTrialBadge } from '@/features/tenant/components/trial-badge';
import { NameHeaderLeft } from './name-header-left';
import { LogoHeaderRight } from './logo-header-right';
import { GlobalSearch } from './global-search';

export const TrialBadge = OriginalTrialBadge;

interface HeaderProps {
  onMenuClick: () => void;
  onAsideClick?: () => void;
  hasAside?: boolean;
  title?: string;
  appName?: string;
  logoUrl?: string;
  userName?: string;
  userRole?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onAsideClick,
  hasAside,
  title,
  appName,
  logoUrl,
  userName,
  userRole,
  className = '',
}) => {
  const { settings } = useSettings();
  // const { searchQuery, setSearchQuery, results, isSearching, clearSearch } = useSearch(); // Moved to GlobalSearch
  const { t } = useText();
  const { user: adminUser, logout: logoutAdmin } = useAdminAuth();
  const { user: appUser, logout: logoutApp } = useTenantAuth();
  // const [showResults, setShowResults] = useState(false);
  // const [isSearchVisible, setIsSearchVisible] = useState(false);
  // const searchRef = useRef<HTMLDivElement>(null);
  // const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = window.location.pathname.startsWith('/admin');
  const currentUser = isAdmin ? adminUser : appUser;

  // Resolve Branding - Global Platform Name (appName) is always used for branding
  const finalAppName = appName || settings.appName || 'SaaS Platform';
  const finalLogoUrl = logoUrl || settings.systemLogoUrl || settings.logoUrl;
  const dashboardPath = isAdmin ? '/admin' : '/app';

  // Resolve User
  const finalUserName = userName || currentUser?.name || settings.currentUser?.name || 'Guest';

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);



  // Keyboard/ClickOutside Logic moved to GlobalSearch.tsx

  const location = useLocation();

  const handleLogout = async () => {
    const isAdminPath = location.pathname.startsWith('/admin');
    if (isAdminPath) {
      await logoutAdmin();
    } else {
      await logoutApp();
    }
  };



  return (
    <header className={`sticky top-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 flex items-center justify-between transition-colors h-[90px] ${className}`}>
      {/* 1. Branding Section - Physically RIGHT in RTL (First Child) - Aligns with Main Nav Sidebar */}
      {/* 1. Branding Section - Physically RIGHT in RTL (First Child) - Aligns with Main Nav Sidebar */}
      <LogoHeaderRight
        appName={finalAppName}
        logoUrl={finalLogoUrl}
        dashboardPath={dashboardPath}
      />

      {/* 2. Main Bar Content - Physically MIDDLE */}
      <div className="flex-1 flex items-center justify-between h-full px-4 lg:px-8 gap-4">
        {/* Dynamic Page Title */}
        <div className="flex items-center group/title">
          <h1 className="text-base font-bold text-gray-500 dark:text-gray-400 px-3 truncate group-hover/title:text-primary transition-colors flex items-center gap-2">
            {title}
          </h1>
        </div>

        {/* Middle Section: Search Bar & Theme Toggle */}
        <div className="flex items-center justify-center flex-1 gap-6">
          <div className="flex-1 flex justify-center">
            <GlobalSearch />
          </div>
          <ThemeToggle />
        </div>

        {/* Right Actions Section - Empty now (moved to sections) */}
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* 3. Actions Section - Physically LEFT in RTL (Last Child) - Aligns with Filter Sidebar */}
      {/* 3. User Actions Section - Physically LEFT in RTL (Last Child) - Aligns with Filter Sidebar */}
      <NameHeaderLeft
        user={currentUser}
        onLogout={handleLogout}
        settingsPath={isAdmin ? '/admin/settings' : '/app/settings'}
      />
    </header>
  );
};
