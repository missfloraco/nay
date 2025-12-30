import React from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import ProfileSettingsForm from '@/shared/components/profile-settings-form';
import { useSettings } from '@/shared/contexts/app-context';
import { useAction } from '@/shared/contexts/action-context';
import { useEffect } from 'react';

export default function AdminSettings() {
    const { settings, updateSettings, updateLocalSettings, loading } = useSettings();
    const { setPrimaryAction } = useAction();

    // Clear sidebar action as the form has its own save button
    useEffect(() => {
        setPrimaryAction(null);
    }, [setPrimaryAction]);

    if (loading || !settings.currentUser) {
        return null; // Or loader
    }

    return (
        <AdminLayout title="الحساب والأمان" noPadding={true}>
            <div className="h-full w-full bg-white dark:bg-dark-950 p-6 lg:p-12 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
                <div className="max-w-none mx-auto">
                    <ProfileSettingsForm
                        initialData={{
                            name: settings.currentUser.name,
                            email: settings.currentUser.email,
                            avatarUrl: settings.currentUser.avatarUrl,
                            email_verified_at: settings.currentUser.email_verified_at
                        }}
                        apiEndpoint="/admin/profile"
                        onSuccess={(data) => {
                            // Instant update
                            updateLocalSettings({ currentUser: data });
                        }}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
