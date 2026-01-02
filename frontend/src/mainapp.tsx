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

const ResetPassword = lazy(() => import('@/features/auth/resetpassword'));

const LandingPage = lazy(() => import('@/features/landing/pages/home'));
const Forbidden = lazy(() => import('@/shared/pages/forbidden'));

const AdminDashboard = lazy(() => import('@/features/superadmin/pages/dashboard'));
const AdminSettings = lazy(() => import('@/features/superadmin/pages/settings'));
const PlatformIdentity = lazy(() => import('@/features/superadmin/pages/platformidentity'));
const OperationsPage = lazy(() => import('@/features/superadmin/pages/operations'));
const SupportTickets = lazy(() => import('@/features/superadmin/pages/supporttickets'));
const AdminPlans = lazy(() => import('@/features/superadmin/pages/plans'));
const PaymentMethods = lazy(() => import('@/features/superadmin/pages/payment-methods'));

const TenantDashboard = lazy(() => import('@/features/tenant/pages/dashboard'));
const TenantSettings = lazy(() => import('@/features/tenant/pages/settings'));
const TenantSupportMessages = lazy(() => import('@/features/tenant/pages/supportmessages'));
const TenantPlans = lazy(() => import('@/features/tenant/pages/plans'));
const TrialExpired = lazy(() => import('@/features/tenant/trial-expired'));
const ActivationWaiting = lazy(() => import('@/features/tenant/pages/activation-waiting'));

const Trash = lazy(() => import('@/shared/pages/trash'));
const WelcomePage = lazy(() => import('@/shared/pages/welcome'));
const NotificationsPage = lazy(() => import('@/shared/pages/notifications-page'));

import { ProtectedRoute } from '@/shared/components/protectedroute';
import ScriptInjector from '@/shared/script-injector';
import { useContentProtection } from '@/shared/hooks/use-content-protection';
import { useAdBlockDetection } from '@/shared/hooks/useAdBlockDetection';
import ShieldOverlay from '@/shared/components/shield-overlay';

const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
);

function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/tenants" element={<OperationsPage />} />
            <Route path="/payments" element={<OperationsPage />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/identity" element={<PlatformIdentity />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/plans" element={<AdminPlans />} />
            <Route path="/scripts" element={<PlatformIdentity />} />
            <Route path="/security" element={<PlatformIdentity />} />
            <Route path="/subscription-requests" element={<OperationsPage />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
    );
}

function AppSubRoutes() {
    return (
        <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<TenantDashboard />} />
            <Route path="/settings" element={<TenantSettings />} />
            <Route path="/support/messages" element={<TenantSupportMessages />} />
            <Route path="/plans" element={<TenantPlans />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/notifications" element={<NotificationsPage />} />
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
import { FeedbackProvider } from '@/shared/ui/notifications/feedback-context';
import { NotificationProvider } from '@/shared/contexts/notification-context';

export default function MainApp() {
    return (
        <AdminAuthProvider>
            <TenantAuthProvider>
                <NotificationProvider>
                    <TextProvider>
                        <ExportProvider>
                            <MainAppContent />
                        </ExportProvider>
                    </TextProvider>
                </NotificationProvider>
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

    useContentProtection();
    const { isAdBlockActive, isCheckingAdBlock } = useAdBlockDetection(settings);

    if (appLoading || adminLoading || (loadingSettings && !localStorage.getItem('app_merged_settings'))) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

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
                        {!isCheckingAdBlock && isAdBlockActive && <ShieldOverlay />}
                        <ExportModal />
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={
                                    loadingLogoutSuccess ? <AuthScreen initialMode="login" /> : <LoginRedirector />
                                } />
                                <Route path="/register" element={<AuthScreen initialMode="register" />} />
                                <Route path="/forgot-password" element={<AuthScreen initialMode="forgot-password" />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/403" element={<Forbidden />} />
                                <Route path="/admin/*" element={
                                    <ProtectedRoute requiredRole="admin" fallbackPath="/login?role=admin">
                                        <Suspense fallback={<PageLoader />}>
                                            <AdminRoutes />
                                        </Suspense>
                                    </ProtectedRoute>
                                } />
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
