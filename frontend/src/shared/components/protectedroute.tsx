import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '@/shared/services/api';
import { useAdminAuth } from '@/features/auth/admin-auth-context';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: 'admin' | 'tenant';
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallbackPath = '/login'
}: ProtectedRouteProps) {
    const location = useLocation();

    // Get contexts
    const { user: adminUser, loading: adminLoading } = useAdminAuth();
    const { user: tenantUser, loading: tenantLoading } = useTenantAuth();

    const currentUser = requiredRole === 'admin' ? adminUser : tenantUser;
    const isLoading = requiredRole === 'admin' ? adminLoading : tenantLoading;

    // Show loading spinner while context is verifying
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Redirect to login if unauthorized
    if (!currentUser) {
        // Special case for admin: if we're looking for an admin but found a tenant user,
        // it's still unauthorized for the admin area.
        return <Navigate to={fallbackPath} replace state={{ from: location }} />;
    }

    // Role-specific cross-check
    if (requiredRole === 'admin' && !currentUser.is_admin) {
        return <Navigate to="/403" replace />;
    }

    if (requiredRole === 'tenant' && currentUser.is_admin) {
        // Admins shouldn't be in the tenant app unless impersonating (which should set tenant user)
        // But for safety, redirect to admin dashboard
        return <Navigate to="/admin" replace />;
    }

    // Render protected content
    return <>{children}</>;
}
