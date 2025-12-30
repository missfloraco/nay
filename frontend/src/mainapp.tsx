import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@/features/auth/admin-auth-context';
import { TenantAuthProvider, useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useUI } from '@/shared/contexts/ui-context';
import { useSettings } from '@/shared/contexts/app-context';
import { HelmetProvider } from 'react-helmet-async';
import AnalyticsProvider from '@/core/providers/analyticsprovider';
import { ActionProvider } from '@/shared/contexts/action-context';
import { SearchProvider } from '@/shared/contexts/search-context';
import { TextProvider } from '@/shared/contexts/text-context';
import { ExportProvider } from '@/shared/contexts/export-context';
import { ExportModal } from '@/shared/ui/modals/export-modal';

// Optimization: Lazy Loading Components for better initial performance
const AuthScreen = lazy(() => import('@/features/auth/authscreen'));
// const Register removed in favor of AuthScreen

const ForgotPassword = lazy(() => import('@/features/auth/forgotpassword'));
const ResetPassword = lazy(() => import('@/features/auth/resetpassword'));

const LandingPage = lazy(() => import('@/features/landing/pages/home'));
const Forbidden = lazy(() => import('@/shared/pages/forbidden'));

const AdminDashboard = lazy(() => import('@/features/superadmin/pages/dashboard'));
const AdminSettings = lazy(() => import('@/features/superadmin/pages/settings'));
const PlatformIdentity = lazy(() => import('@/features/superadmin/pages/platformidentity'));
const TenantsList = lazy(() => import('@/features/superadmin/pages/tenants/list'));
const PaymentsPage = lazy(() => import('@/features/superadmin/pages/payments'));
const AdManagement = lazy(() => import('@/features/superadmin/pages/admanagement'));
const SupportTickets = lazy(() => import('@/features/superadmin/pages/supporttickets'));
const SeoManagement = lazy(() => import('@/features/superadmin/pages/seomanagement'));

const TenantDashboard = lazy(() => import('@/features/tenant/pages/dashboard'));
const TenantSettings = lazy(() => import('@/features/tenant/pages/settings'));
const TenantSupportMessages = lazy(() => import('@/features/tenant/pages/supportmessages'));
const TrialExpired = lazy(() => import('@/features/tenant/trial-expired'));
const ActivationWaiting = lazy(() => import('@/features/tenant/pages/activation-waiting'));
// Unified Trash Page
const Trash = lazy(() => import('@/shared/pages/trash'));

// Security: Import ProtectedRoute for backend-verified route protection
import { ProtectedRoute } from '@/shared/components/protectedroute';
import ScriptInjector from '@/shared/script-injector';

// Loading Fallback Component
const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
);

function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/tenants" element={<TenantsList />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/ads" element={<AdManagement />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/identity" element={<PlatformIdentity />} />
            <Route path="/seo" element={<SeoManagement />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
    );
}

function AppSubRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TenantDashboard />} />
            <Route path="/settings" element={<TenantSettings />} />
            <Route path="/support/messages" element={<TenantSupportMessages />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="*" element={<Navigate to="/app" />} />
        </Routes>
    );
}

function LoginRedirector() {
    const { user: appUser } = useTenantAuth();
    const { user: adminUser } = useAdminAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');

    if (roleParam === 'admin' && adminUser) return <Navigate to="/admin" />;
    if (!roleParam && appUser) return <Navigate to="/app" />;

    return <AuthScreen initialMode="login" />;
}


import { useTrialStatus } from '@/core/hooks/usetrialstatus';

import { FeedbackProvider, TrialAlert } from '@/shared/ui/notifications/feedback-context';

export default function MainApp() {
    return (
        <AdminAuthProvider>
            <TenantAuthProvider>
                <TextProvider>
                    <ExportProvider>
                        <MainAppContent />
                    </ExportProvider>
                </TextProvider>
            </TenantAuthProvider>
        </AdminAuthProvider>
    );
}


function MainAppContent() {
    const { user: appUser, tenant, loading: appLoading, isImpersonating } = useTenantAuth();
    const { user: adminUser, loading: adminLoading } = useAdminAuth();
    const { settings, loadingSettings } = useSettings();
    const location = useLocation();
    const loadingLogoutSuccess = location.search.includes('logout=success');
    const { isTrialExpired } = useTrialStatus();


    if (appLoading || adminLoading || (loadingSettings && !localStorage.getItem('app_merged_settings'))) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Tenant Blocking Logic (Pending / Expired / Disabled)
    if (appUser && tenant && !isImpersonating) {
        if (tenant.status === 'pending') {
            return (
                <HelmetProvider>
                    <Suspense fallback={<PageLoader />}>
                        <ActivationWaiting />
                    </Suspense>
                </HelmetProvider>
            );
        }

        if (tenant.status === 'expired' || tenant.status === 'disabled' || isTrialExpired) {
            return (
                <HelmetProvider>
                    <Suspense fallback={<PageLoader />}>
                        <TrialExpired />
                    </Suspense>
                </HelmetProvider>
            );
        }
    }


    return (
        <HelmetProvider>
            <AnalyticsProvider>
                <ActionProvider>
                    <SearchProvider>
                        <ScriptInjector />
                        <ExportModal />
                        <TrialAlert />
                        <Suspense fallback={<PageLoader />}>


                            <Routes>
                                <Route path="/" element={<LandingPage />} />

                                <Route path="/login" element={
                                    loadingLogoutSuccess ? <AuthScreen initialMode="login" /> : <LoginRedirector />
                                } />

                                <Route path="/register" element={<AuthScreen initialMode="register" />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />

                                {/* 403 Forbidden Page */}
                                <Route path="/403" element={<Forbidden />} />

                                {/* Admin Routes - Backend Verified */}
                                <Route path="/admin/*" element={
                                    <ProtectedRoute requiredRole="admin" fallbackPath="/login?role=admin">
                                        <Suspense fallback={<PageLoader />}>
                                            <AdminRoutes />
                                        </Suspense>
                                    </ProtectedRoute>
                                } />

                                {/* Tenant Routes - Backend Verified */}
                                <Route path="/app/*" element={
                                    <ProtectedRoute requiredRole="tenant" fallbackPath="/login">
                                        <Suspense fallback={<PageLoader />}>
                                            <AppSubRoutes />
                                        </Suspense>
                                    </ProtectedRoute>
                                } />

                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Suspense>
                    </SearchProvider>
                </ActionProvider>
            </AnalyticsProvider>
        </HelmetProvider >
    );
}
