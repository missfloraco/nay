import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import ProfileSettingsForm from '@/shared/components/profile-settings-form';
import { SplitSettingsLayout } from '@/shared/components/split-settings-layout';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAction } from '@/shared/contexts/action-context';
import { useTrialStatus } from '@/core/hooks/usetrialstatus';
import { useRef, useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';

export default function TenantSettings() {
    const { user, tenant, refreshUser, updateLocalUser } = useTenantAuth();
    const { setPrimaryAction } = useAction();
    const { isTrialActive, daysRemaining, trialExpiresAt } = useTrialStatus();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setPrimaryAction({
            label: isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات',
            icon: Save,
            onClick: () => {
                if (formRef.current) {
                    setIsSaving(true);
                    formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    // Timeout fallback
                    setTimeout(() => setIsSaving(false), 2000);
                }
            },
            loading: isSaving,
            disabled: isSaving
        });
        return () => setPrimaryAction(null);
    }, [setPrimaryAction, isSaving]);

    if (!tenant) return null;

    return (
        <AppLayout title="الإعدادات الشخصية" icon={Settings} noPadding={true}>
            <div className="w-full bg-transparent animate-in fade-in duration-700 p-4 lg:p-8">
                <SplitSettingsLayout
                    userData={{
                        name: tenant.name,
                        email: tenant.email,
                        avatarUrl: tenant.avatar_url,
                        role: 'مشترك',
                        email_verified_at: tenant.email_verified_at,
                        created_at: tenant.created_at,
                        last_login_at: tenant.last_login_at
                    }}
                    trialInfo={{
                        isActive: isTrialActive,
                        daysRemaining: daysRemaining,
                        expiresAt: trialExpiresAt || ''
                    }}
                >
                    <ProfileSettingsForm
                        initialData={{
                            name: tenant.name,
                            email: tenant.email,
                            avatarUrl: tenant.avatar_url,
                            logo_url: tenant.logo_url,
                            whatsapp: tenant.whatsapp,
                            country_code: tenant.country_code,
                            email_verified_at: tenant.email_verified_at,
                            created_at: tenant.created_at
                        }}
                        apiEndpoint="/app/profile"
                        isTenant={true}
                        onSuccess={(data) => {
                            updateLocalUser(data);
                            refreshUser();
                            setIsSaving(false);
                        }}
                        formRef={formRef}
                        hideAction={true}
                    />
                </SplitSettingsLayout>
            </div>
        </AppLayout>
    );
}
