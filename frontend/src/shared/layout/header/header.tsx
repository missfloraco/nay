import React, { useState, useRef, useEffect } from 'react';
import { Menu, Power } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { TrialBadge as OriginalTrialBadge } from '@/features/tenant/components/trial-badge';
import { NameHeaderLeft } from './name-header-left';
import { LogoHeaderRight } from './logo-header-right';
import { GlobalSearch } from './global-search';
import { ThemeToggle } from './theme-toggle';
import { useUI } from '@/shared/contexts/ui-context';
import { MoreVertical, Menu as MenuIcon } from 'lucide-react';

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
  const { toggleRightDrawer, toggleLeftDrawer } = useUI();
  const { t } = useText();
  const { user: adminUser, logout: logoutAdmin } = useAdminAuth();
  const { user: appUser, logout: logoutApp } = useTenantAuth();

  const isAdmin = window.location.pathname.startsWith('/admin');
  const currentUser = isAdmin ? adminUser : appUser;

  // Resolve Branding
  const finalAppName = appName || settings.appName || '';
  const finalLogoUrl = logoUrl || settings.systemLogoUrl || settings.logoUrl;
  const dashboardPath = isAdmin ? '/admin' : '/app';

  const navigate = useNavigate();
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
    <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between transition-colors h-[90px] global-header ${className}`}>
      {/* 1. Branding Section - Aligns with Main Nav Sidebar (250px) */}
      <div className="flex items-center w-auto lg:w-[250px] flex-shrink-0 global-header-branding">
        <LogoHeaderRight
          appName={finalAppName}
          logoUrl={finalLogoUrl}
          dashboardPath={dashboardPath}
        />
      </div>

      {/* 2. Main Bar Content - Physically MIDDLE */}
      <div className="flex-1 flex items-center justify-center lg:justify-between h-full px-4 lg:px-8 gap-4 relative">
        {/* Dynamic Page Title - Centered on Mobile, Start-aligned on Desktop */}
        <div className="flex items-center group/title page-title-heading truncate absolute lg:relative left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0">
          <h1 className="text-sm lg:text-base font-bold text-gray-400 px-3 truncate group-hover/title:text-primary transition-colors flex items-center gap-2">
            {title}
          </h1>
        </div>

        {/* Middle Section: Search Bar (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-[600px] mx-auto">
          <GlobalSearch variant="header-center" />
        </div>
      </div>

      {/* 3. User Actions Section - Aligns with Filter Sidebar (250px) */}
      <div className="flex items-center w-auto lg:w-[250px] justify-end flex-shrink-0 px-4 lg:px-0 gap-3">
        {/* Mobile Actions Overlay */}
        {/* Mobile Actions Overlay (Left side in RTL) */}
        <div className="flex sm:hidden items-center gap-2">
          <GlobalSearch variant="header-left" />
          <ThemeToggle />
        </div>

        <div className="hidden sm:flex items-center gap-4 w-full justify-end">
          <ThemeToggle />
          <div className="h-8 w-px bg-gray-200 mx-1" />
          <NameHeaderLeft
            user={currentUser}
            onLogout={handleLogout}
            settingsPath={isAdmin ? '/admin/settings' : '/app/settings'}
          />
        </div>
      </div>
    </header>
  );
};
