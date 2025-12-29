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
    trialExpiresAt: string | null;
}

/**
 * Hook to get tenant trial status information
 */
export function useTrialStatus(): TrialStatus {
    const { user } = useTenantAuth();

    const status = user?.status ?? null;
    const trialExpiresAt = user?.trial_expires_at ?? null;

    const isTrialExpired = status === 'expired' || (trialExpiresAt !== null && new Date(trialExpiresAt) < new Date());
    const isDisabled = status === 'disabled';
    const isPending = status === 'pending';
    const isActive = status === 'active';

    // A trial is active if status is 'trial' and trial_expires_at is in the future
    const isTrialActive = status === 'trial' && trialExpiresAt !== null && new Date(trialExpiresAt) > new Date();

    const daysRemaining = useMemo(() => {
        if (!user?.trial_expires_at) return 0;

        const expirationDate = new Date(user.trial_expires_at);
        const now = new Date();
        const diffTime = expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }, [user?.trial_expires_at]);

    return {
        status,
        isTrialActive,
        isTrialExpired,
        isDisabled,
        isPending,
        isActive,
        daysRemaining,
        trialExpiresAt: user?.trial_expires_at ?? null,
    };
}
