import { LucideIcon } from 'lucide-react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
}

export interface NavItem {
  id: ViewState;
  label: string; // Dynamic label from API
  icon: LucideIcon;
}

// ------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------

export interface GlobalSettings {
  appName: string;
  storeName?: string; // Tenant specific name
  appDescription: string;
  appType?: 'pos' | 'finance' | 'tools' | 'ecommerce';
  // DYNAMIC: Color palette from API
  primaryColor: string;    // Default: #2a8cff (Blue)
  secondaryColor?: string; // Default: #ffc108 (Yellow)
  accentColor1?: string;   // Default: #02aa94 (Teal)
  accentColor2?: string;   // Default: #fb005e (Pink)
  // DYNAMIC: Font family from API
  fontFamily?: string;     // Default: 'Alexandria, sans-serif'
  customFontFile?: string;
  customHeadingFontFile?: string;
  customFontUrl?: string;
  customHeadingFontUrl?: string;
  // DYNAMIC: System defaults
  defaultCountry?: string; // Default: 'PS' (Palestine)
  defaultCurrency?: string; // Default: 'ILS' (Shekel)
  dateFormat?: string;     // Default: 'DD/MM/YYYY'
  logoUrl?: string;
  faviconUrl?: string;
  landingLogoUrl?: string;
  adminLogoUrl?: string;
  currency: string;
  // Landing Page Management
  landing_hero_title?: string;
  landing_hero_subtitle?: string;
  landing_hero_cta?: string;
  landing_hero_image?: string;
  landing_features?: string; // JSON string
  landing_faq?: string;      // JSON string
  landing_footer_text?: string;
  // Payment Gateways
  bank_transfer_enabled?: boolean;
  bank_transfer_details?: string;
  dodopayments_enabled?: boolean;
  dodopayments_api_key?: string;
  dodopayments_webhook_secret?: string;
  dodopayments_mode?: 'test' | 'live';
  stripe_enabled?: boolean;
  stripe_key?: string;
  stripe_secret?: string;
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_secret?: string;
  // DYNAMIC FOOTER
  companyName?: string;
  companyLink?: string;
  copyright_text?: string;
  translations: {
    dashboard: string;
    users: string;
    analytics: string;
    settings: string;
    logout: string;
    searchPlaceholder: string;
    welcomeMessage: string;
  };
  currentUser?: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  ad_landing_top?: string;
  ad_landing_footer?: string;
  ad_dashboard_banner?: string;
  ad_sidebar?: string;
  ad_sidebar_square?: string;
  ad_content_top?: string;
  ad_content_bottom?: string;
  ad_footer_leaderboard?: string;
  custom_css?: string;
  ui_tweaks?: Record<string, boolean>;
  trial_period_days?: number;
  // Allow dynamic settings for ads and other future properties
  [key: string]: any;
}

export type DateRangeOption = '7d' | '30d' | '90d' | 'all' | 'last7';

export interface DashboardData {
  stats: StatCardProps[];
  revenueChart: ChartDataPoint[];
  trafficChart: ChartDataPoint[];
  trafficSources: { label: string; val: string; color: string }[];
}

export interface Tenant {
  id: number;
  uid: string;
  name: string; // Store name
  whatsapp?: string;
  logo_url?: string;
  avatar_url?: string;
  country_code?: string;
  currency_code?: string;
  status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled';
  trial_expires_at?: string;
  onboarding_completed: boolean;
  app_type: string;
  settings?: any;
  created_at?: string;
  subscription_ends_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  label: string;
  group: string;
}

export interface Role {
  id: number;
  name: string;
  label: string;
  is_system: boolean;
  permissions?: Permission[];
}

export interface User {
  id: number;
  tenant_id: number;
  role_id?: number;
  role?: Role;
  name: string;
  email: string;
  is_active: boolean;
  avatar_url?: string;
  last_login_at?: string;
  preferences?: any;
  is_admin?: boolean;
  created_at?: string;
}

// ------------------------------------------------------------------
// Assets & Generic Types (To be replaced by domain-specific modules)
// ------------------------------------------------------------------

export interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon?: LucideIcon;
  iconName?: string;
  trendLabel: string;
  colorFrom?: string;
  colorTo?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}
