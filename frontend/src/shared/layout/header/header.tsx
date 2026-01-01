import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/shared/contexts/app-context';
import { useText } from '@/shared/contexts/text-context';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { TrialBadge as OriginalTrialBadge } from '@/features/tenant/components/trial-badge';
import { NameHeaderLeft } from './name-header-left';
import { GlobalSearch } from './global-search';
import { ThemeToggle } from './theme-toggle';
import { useUI } from '@/shared/contexts/ui-context';
import { MoreVertical, Menu as MenuIcon, MessageSquare, Headset, Menu, Power } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';

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
  hideBranding?: boolean;
  mobileOnlyBranding?: boolean;
  actions?: React.ReactNode;
  icon?: any; // Accepting any icon component
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
  hideBranding = false,
  mobileOnlyBranding = false,
  actions,
  icon: Icon,
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

  // Support Notifications
  const { data: supportNotif } = useQuery({
    queryKey: [isAdmin ? 'admin-notifications-count' : 'support-notifications-count'],
    queryFn: () => api.get(isAdmin ? '/admin/notifications/support' : '/app/support/notifications/support'),
    refetchInterval: 10000,
    enabled: !!currentUser
  });

  const supportUnreadCount = (supportNotif as any)?.count || 0;
  const supportPath = isAdmin ? '/admin/support' : '/app/support/messages';

  return (
    <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between transition-colors h-[90px] global-header ${className}`}>
      {/* 1. Branding Section - Aligns with Main Nav Sidebar (250px) */}
      {!hideBranding && (
        <div className={`flex items-center w-auto lg:w-[250px] flex-shrink-0 global-header-branding ${mobileOnlyBranding ? 'lg:hidden' : ''}`}>
          <div className="flex items-center h-full px-4 lg:pr-8 lg:pl-6 lg:border-l border-gray-300 flex-shrink-0 justify-between header-logo-section">
            <Link
              to={dashboardPath}
              className="flex items-center gap-3 transition-all duration-300 hover:opacity-80 active:scale-95 group overflow-hidden"
            >
              <div className="flex items-center gap-3 truncate">
                {finalLogoUrl ? (
                  <img
                    src={finalLogoUrl}
                    alt={finalAppName}
                    className="h-8 lg:h-9 w-auto max-w-[120px] object-contain group-hover:rotate-1 transition-transform logo-img"
                  />
                ) : null}
                <span
                  className="text-sm lg:text-lg font-black text-gray-900 transition-colors truncate block tracking-tight app-name-text"
                >
                  {finalAppName}
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Main Bar Content - Physically MIDDLE */}
      <div className="flex-1 flex items-center justify-center lg:justify-between h-full px-4 lg:px-8 gap-4 relative">
        <div className="flex items-center gap-6 group/title page-title-heading truncate absolute lg:relative left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0">
          <div className="flex items-center gap-3 px-3">
            {Icon && <Icon className="w-5 h-5 text-gray-400 group-hover/title:text-primary transition-colors" />}
            <h1 className="text-sm lg:text-base font-bold text-gray-400 truncate group-hover/title:text-primary transition-colors flex items-center gap-2">
              {title}
            </h1>
          </div>
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
          {/* Mobile Search Icon */}
          <GlobalSearch variant="header-left" />
        </div>

        <div className="hidden sm:flex items-center gap-4 w-full justify-end h-full">
          <Link
            to={supportPath}
            className="relative group flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all"
            title={t('support.title', 'الدعم الفني')}
          >
            <Headset className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {supportUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-dark-900 shadow-lg animate-pulse">
                {supportUnreadCount > 9 ? '9+' : supportUnreadCount}
              </span>
            )}
          </Link>

          <div className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all">
            <ThemeToggle />
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

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
