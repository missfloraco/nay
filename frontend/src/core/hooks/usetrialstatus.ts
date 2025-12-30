import { useMemo } from 'react';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';

export interface TrialStatus {
    status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled' | null;
    isTrialActive: boolean;
    isTrialExpired: boolean;
    isDisabled: boolean;
    isPending: boolean;
    isActive: boolean;
    daysRemaining: number;
    subDaysRemaining: number;
    trialExpiresAt: string | null;
    subscriptionEndsAt: string | null;
}

/**
 * Hook to get tenant trial status information
 */
export function useTrialStatus(): TrialStatus {
    const { user } = useTenantAuth();

    const status = user?.status ?? null;
    const trialExpiresAt = user?.trial_expires_at ?? null;
    const subscriptionEndsAt = (user as any)?.subscription_ends_at ?? null;

    const isTrialExpired = status === 'expired' || (trialExpiresAt !== null && new Date(trialExpiresAt) < new Date());
    const isDisabled = status === 'disabled';
    const isPending = status === 'pending';
    const isActive = status === 'active';

    // A trial is active if status is 'trial' and trial_expires_at is in the future
    const isTrialActive = status === 'trial' && trialExpiresAt !== null && new Date(trialExpiresAt) > new Date();

    const daysRemaining = useMemo(() => {
        if (!trialExpiresAt) return 0;
        const expirationDate = new Date(trialExpiresAt);
        const now = new Date();
        const diffTime = expirationDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }, [trialExpiresAt]);

    const subDaysRemaining = useMemo(() => {
        if (!subscriptionEndsAt) return 0;
        const expirationDate = new Date(subscriptionEndsAt);
        const now = new Date();
        const diffTime = expirationDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }, [subscriptionEndsAt]);

    return {
        status,
        isTrialActive,
        isTrialExpired,
        isDisabled,
        isPending,
        isActive,
        daysRemaining,
        subDaysRemaining,
        trialExpiresAt,
        subscriptionEndsAt,
    };
}
