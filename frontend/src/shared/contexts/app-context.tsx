import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';
import { User, GlobalSettings } from '@/core/models/index';
import { UI_TEXT } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import api, { BASE_URL } from '@/shared/services/api';
import { API_BASE_URL, API_ROOT_URL, SYSTEM_LABELS } from '@/core/config';
import { logger } from '@/shared/services/logger';
import { useAdBlockDetection } from '@/shared/hooks/useAdBlockDetection';
import { useFontManager } from '@/shared/hooks/useFontManager';

export const defaultSettings: GlobalSettings = {
  appName: "",
  appDescription: SYSTEM_LABELS.appDescription,
  // [Static] Default Theme Colors (Fallback)
  primaryColor: "#2a8cff",
  secondaryColor: "#ffc108",
  accentColor1: "#02aa94",
  accentColor2: "#fb005e",
  fontFamily: "Default",
  defaultCountry: "PS",
  defaultCurrency: "ILS",
  dateFormat: "DD/MM/YYYY",
  currency: "ر.س",
  // [Static] Default Translations Structure (Populated by API)
  translations: {
    ...UI_TEXT,
    dashboard: "لوحة التحكم",
    users: "المستخدمين",
    analytics: "التحليلات",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    searchPlaceholder: "بحث عام...",
    welcomeMessage: "مرحباً بك",
  },
  currentUser: null as any,
  systemLogoUrl: null
};

export interface AppContextType {
  settings: GlobalSettings;
  loading: boolean;
  darkMode: boolean;
  toggleTheme: () => void;
  refreshSettings: () => void;
  updateSettings: (settings: Partial<GlobalSettings>) => Promise<void>;
  updateLocalSettings: (settings: Partial<GlobalSettings>) => void;
  isAdBlockActive: boolean;
  isCheckingAdBlock: boolean;
  // [Dynamic] Helper to get translations with fallback
  t: (path: string, defaultValue?: string) => string;
}

export const AppContext = createContext<AppContextType>({
  settings: defaultSettings,
  loading: true,
  darkMode: false,
  toggleTheme: () => { },
  refreshSettings: () => { },
  updateSettings: async () => { },
  updateLocalSettings: () => { },
  isAdBlockActive: false,
  isCheckingAdBlock: true,
  t: (path) => path,
});

export const useSettings = () => useContext(AppContext);

/**
 * [Static Structural Component] AppProvider
 * Manages the layout's dynamic state while keeping the structure static.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // [Static Data] Load from cache for Instant UI
  const getInitialSettings = (): GlobalSettings => {
    try {
      const cached = localStorage.getItem('app_merged_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) { /* empty */ }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<GlobalSettings>(getInitialSettings);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Use extracted hooks for better code organization
  const { isAdBlockActive, isCheckingAdBlock } = useAdBlockDetection(settings.adblock_enabled || false);
  useFontManager({
    fontFamily: settings.fontFamily,
    customFontFile: settings.customFontFile,
    customHeadingFontFile: settings.customHeadingFontFile,
    customFontUrl: settings.customFontUrl,
    customHeadingFontUrl: settings.customHeadingFontUrl
  });

  useEffect(() => {
    // [Static Appearance] Handle Dark Mode Toggle
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      const type = window.location.pathname.startsWith('/admin') ? 'admin' : 'app';
      await api.post(`/${type}/preferences`, { dark_mode: newDarkMode });
    } catch (e) { logger.warn('Sync preferences failed', e); }
  };



  /**
   * [Dynamic Data] fetchSettings
   * Orchestrates fetching of all API-driven values: Labels, Colors, Assets.
   */
  const fetchSettings = async (force = false) => {
    const domain = window.location.hostname;
    const path = window.location.pathname;

    // 0. Avoid redundant calls if the path/domain hasn't changed since last fetch
    const fingerprint = `${domain}${path}`;
    if (!force && (window as any)._lastSettingsFetch === fingerprint) return;
    (window as any)._lastSettingsFetch = fingerprint;

    try {
      setLoading(true);

      const isAdminPath = path.includes('/admin');
      const isAppPath = path.includes('/app');
      // Fix: better userType detection
      const userType = isAdminPath ? 'admin' : (isAppPath ? 'app' : 'app');

      // Route intelligence
      const isPublicPath = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/403'].some(p => path === p || path.startsWith(p + '?'));
      const isLanding = path === '/';

      // Ensure CSRF for stateful requests
      try {
        const { getCsrfCookie } = await import('@/shared/services/api');
        await getCsrfCookie();
      } catch (e) { /* empty */ }

      let systemBranding: Record<string, any> = {};
      let authenticatedData: Record<string, any> = {};
      let userInfo: (User & { tenant?: any }) | null = null;

      // Execute all core data fetches
      const fetches: Promise<any>[] = [
        api.get('/public/settings/branding')
      ];

      // Only fetch authenticated data if not on a strictly public path OR if we're on landing (to check session)
      if (isAdminPath) {
        fetches.push(SettingsService.getSettings('admin'));
        fetches.push(api.get('/admin/user', { _silent: true } as any));
      } else if (isAppPath) {
        fetches.push(api.get('/app/user', { _silent: true } as any));
      } else if (isLanding) {
        // On landing, only try user info to show "Dashboard" button, avoid settings 404
        // Use silent: true to avoid 401 redirect to login
        fetches.push(api.get(`/${userType}/user`, { _silent: true } as any));
      }

      const results = await Promise.allSettled(fetches);
      const [sysRes] = results;

      // Process results by index based on what we fetched
      let resultIdx = 2;

      // Process Branding Data
      if (sysRes.status === 'fulfilled') {
        systemBranding = (sysRes.value as any) || {};
      }


      // Process Authenticated Settings (Admin only for now)
      if (isAdminPath && results[1]?.status === 'fulfilled') {
        authenticatedData = (results[1] as any).value || {};
        resultIdx = 2;
      } else {
        resultIdx = 1;
      }

      // Process User Info
      const userRes = results[resultIdx];
      if (userRes && userRes.status === 'fulfilled') {
        const rawData = (userRes as any).value || {};
        // Handle new structure { user, tenant } or legacy
        userInfo = rawData.user || rawData;
        const tenantInfo = rawData.tenant || null;

        if (userInfo?.preferences?.dark_mode !== undefined) {
          setDarkMode(!!userInfo.preferences.dark_mode);
        }
        // Attach tenant info to userInfo for easier merging later
        if (tenantInfo && userInfo) userInfo.tenant = tenantInfo;
      }


      setSettings(prev => {
        const normalizeUrl = (url?: any) => {
          if (!url || typeof url !== 'string' || url === 'null' || url === '[]' || url === '') return null;
          if (url.startsWith('http')) return url;

          // Remove leading slashes
          let cleanPath = url.replace(/^\/+/, '');

          // Handle cases where path might already be full storage/
          const hasStoragePrefix = cleanPath.startsWith('storage/');
          const hasPublicPrefix = cleanPath.startsWith('public/');

          if (!hasStoragePrefix && !hasPublicPrefix) {
            cleanPath = 'storage/' + cleanPath;
          }

          // Ensure we use the correct API root if available, otherwise relative to current origin
          const root = (window as any).API_ROOT_URL || '';
          const relativeUrl = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

          // Add cache buster for branding assets
          const isBranding = cleanPath.includes('branding') || cleanPath.includes('logo') || cleanPath.includes('favicon') || cleanPath.includes('identity') || cleanPath.includes('fonts');
          return isBranding ? `${relativeUrl}?v=${Date.now()}` : relativeUrl;
        };

        // UI IDENTITY: Always prioritize System Branding
        const finalFontFamily = systemBranding.font_family || 'Default';
        const finalCustomFontFile = normalizeUrl(systemBranding.custom_font_file);

        const merged = {
          ...prev,
          appName: systemBranding.app_name !== undefined ? systemBranding.app_name : prev.appName,

          // Tenant specific overrides
          storeName: userInfo?.tenant?.name || authenticatedData.store_name || prev.storeName,

          // DYNAMIC BRANDING: Strictly controlled by Super Admin
          primaryColor: systemBranding.primary_color !== undefined ? systemBranding.primary_color : prev.primaryColor,
          secondaryColor: systemBranding.secondary_color !== undefined ? systemBranding.secondary_color : prev.secondaryColor,
          accentColor1: systemBranding.accent_color1 !== undefined ? systemBranding.accent_color1 : prev.accentColor1,
          accentColor2: systemBranding.accent_color2 !== undefined ? systemBranding.accent_color2 : prev.accentColor2,

          // DYNAMIC FOOTER
          companyName: systemBranding.company_name !== undefined ? systemBranding.company_name : prev.companyName,
          companyLink: systemBranding.company_link !== undefined ? systemBranding.company_link : prev.companyLink,

          // ASSETS: Unified across all tenants
          logoUrl: systemBranding.logo_url !== undefined ? normalizeUrl(systemBranding.logo_url) : prev.logoUrl,
          faviconUrl: systemBranding.favicon_url !== undefined ? normalizeUrl(systemBranding.favicon_url) : prev.faviconUrl,
          systemLogoUrl: systemBranding.logo_url !== undefined ? normalizeUrl(systemBranding.logo_url) : prev.systemLogoUrl,

          translations: systemBranding.translations !== undefined ? systemBranding.translations : prev.translations,
          fontFamily: finalFontFamily,
          customFontFile: finalCustomFontFile,
          customHeadingFontFile: normalizeUrl(systemBranding.custom_heading_font_file),
          customFontUrl: systemBranding.custom_font_url,
          customHeadingFontUrl: systemBranding.custom_heading_font_url,

          // ADS & TRACKING: Global Super Admin control
          ...Object.keys(systemBranding).filter(k => k.startsWith('ad_') || k.startsWith('adblock')).reduce((acc, k) => {
            // If it's a tenant-specific view and ads are disabled for this tenant, clear ad contents
            const adsEnabled = userInfo?.tenant?.ads_enabled !== false;
            if (!adsEnabled && k.startsWith('ad_') && !isAdminPath) {
              return { ...acc, [k]: null };
            }
            return { ...acc, [k]: systemBranding[k] };
          }, {}),

          currentUser: userInfo ? {
            ...userInfo,
            avatarUrl: (userInfo as any).avatar !== undefined || (userInfo as any).avatar_url !== undefined
              ? normalizeUrl((userInfo as any).avatar || (userInfo as any).avatar_url)
              : prev.currentUser?.avatarUrl
          } : prev.currentUser,

          tax_rate: authenticatedData.tax_rate !== undefined ? Number(authenticatedData.tax_rate) : prev.tax_rate,
        };

        // [Static UI Refresh] Update CSS Variables for Dynamic Colors
        if (merged.primaryColor) document.documentElement.style.setProperty('--color-primary', merged.primaryColor);
        if (merged.secondaryColor) document.documentElement.style.setProperty('--color-secondary', merged.secondaryColor);
        if (merged.accentColor1) document.documentElement.style.setProperty('--color-accent1', merged.accentColor1);
        if (merged.accentColor2) document.documentElement.style.setProperty('--color-accent2', merged.accentColor2);


        // [Optimization] Cache merged settings for next load
        localStorage.setItem('app_merged_settings', JSON.stringify(merged));

        return merged;
      });

    } catch (e) {
      logger.error('Settings fetch failure', e);
    } finally {
      setLoading(false);
      // Mark initialization as high priority done
      document.body.classList.add('app-ready');
    }
  };

  /**
   * [Dynamic Helper] t
   * Resolves translation keys from the API-driven translations object.
   */
  const t = (path: string, defaultValue?: string): string => {
    const keys = path.split('.');

    // 1. Try dynamic translations from API
    let result: any = settings?.translations;
    if (result && typeof result === 'object') {
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          result = null;
          break;
        }
      }
    } else {
      result = null;
    }

    if (typeof result === 'string') return result;

    // 2. Try static UI_TEXT as fallback
    let staticResult: any = UI_TEXT;
    if (staticResult && typeof staticResult === 'object') {
      for (const key of keys) {
        if (staticResult && typeof staticResult === 'object' && key in staticResult) {
          staticResult = staticResult[key];
        } else {
          staticResult = null;
          break;
        }
      }
    } else {
      staticResult = null;
    }

    if (typeof staticResult === 'string') return staticResult;

    // 3. Last resort: default value or path
    return defaultValue || path;
  };

  const updateSettings = async (newSettings: Partial<GlobalSettings>) => {
    const userType = window.location.pathname.startsWith('/admin') ? 'admin' : 'app';
    await SettingsService.updateSettings(userType, newSettings);
    await fetchSettings();
  };

  const updateLocalSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    fetchSettings();
  }, []); // Re-fetch all dynamic data on mount


  // Dynamic Page Title & Favicon Update
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isLandingPage = currentPath === '/';

    // CRITICAL: Never set title on landing page - SEO system handles it
    // Only set title from app_name for admin/tenant pages
    if (settings.appName && !isLandingPage) {
      document.title = settings.appName;
    }

    if (settings.faviconUrl) {
      const url = settings.faviconUrl; // Already has cache buster from normalizeUrl
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
      localStorage.setItem('app_favicon', url);
    }
  }, [settings.appName, settings.faviconUrl]);

  return (
    <AppContext.Provider value={{ settings, loading, darkMode, toggleTheme, refreshSettings: fetchSettings, updateSettings, updateLocalSettings, isAdBlockActive, isCheckingAdBlock, t }}>
      {children}
    </AppContext.Provider>
  );
};
