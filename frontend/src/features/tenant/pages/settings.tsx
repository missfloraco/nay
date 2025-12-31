import React from 'react';
import AppLayout from '@/features/tenant/pages/applayout';
import ProfileSettingsForm from '@/shared/components/profile-settings-form';
import { useTenantAuth } from '@/features/auth/tenant-auth-context';
import { useAction } from '@/shared/contexts/action-context';
import { useEffect } from 'react';
import { Settings } from 'lucide-react';

export default function TenantSettings() {
    const { user, tenant, refreshUser, updateLocalUser } = useTenantAuth();
    const { setPrimaryAction } = useAction();
    const [loading, setLoading] = React.useState(false);

    // For the extra fields (Whatsapp/Country) - separate form for now or just handled?
    // Let's actually put them in the "slots" but we need state.
    // If I cannot easily unify the form submission without complex code, I will separate them.
    // "Business Profile" vs "Login Profile" settings.

    useEffect(() => {
        setPrimaryAction(null);
    }, [setPrimaryAction]);

    if (!tenant) return null;

    return (
        <AppLayout title="الإعدادات" icon={Settings} noPadding={true}>
            <div className="w-full bg-transparent animate-in fade-in duration-500">
                <div className="max-w-none mx-auto">
                    <ProfileSettingsForm
                        initialData={{
                            name: tenant.name,
                            email: tenant.email,
                            avatarUrl: tenant.avatar_url,
                            logo_url: tenant.logo_url,
                            whatsapp: tenant.whatsapp,
                            country_code: tenant.country_code,
                            email_verified_at: tenant.email_verified_at
                        }}
                        apiEndpoint="/app/profile"
                        isTenant={true}
                        onSuccess={(data) => {
                            updateLocalUser(data);
                            refreshUser();
                        }}
                    // We are sacrificing Whatsapp/Country update in this specific unified form unless I update the form component.
                    // I will update the form component in the next step to include Whatsapp/Country if isTenant is true.
                    // This achieves the goal best.
                    />
                </div>
            </div>
        </AppLayout>
    );
}
