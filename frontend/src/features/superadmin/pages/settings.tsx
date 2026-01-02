import React, { useEffect, useRef, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import ProfileSettingsForm from '@/shared/components/profile-settings-form';
import { SplitSettingsLayout } from '@/shared/components/split-settings-layout';
import { useSettings } from '@/shared/contexts/app-context';
import { useAction } from '@/shared/contexts/action-context';

export default function AdminSettings() {
    const { settings, updateLocalSettings, loading } = useSettings();
    const { setPrimaryAction } = useAction();
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

    if (loading) {
        return (
            <AdminLayout title="جاري التحميل..." icon={Settings} noPadding={true}>
                <div className="p-10 flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!settings.currentUser) {
        return (
            <AdminLayout title="خطأ في البيانات" icon={Settings} noPadding={true}>
                <div className="p-10 text-center text-gray-500">
                    لم يتم العثور على بيانات المستخدم. يرجى إعادة تسجيل الدخول.
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="الحساب والأمان" icon={Settings} noPadding={true}>
            <div className="w-full max-w-[1600px] mx-auto bg-transparent animate-in fade-in duration-500 pb-8">
                <SplitSettingsLayout
                    userData={{
                        name: settings.currentUser.name,
                        email: settings.currentUser.email,
                        avatarUrl: settings.currentUser.avatarUrl,
                        role: 'مدير النظام',
                        email_verified_at: settings.currentUser.email_verified_at,
                        created_at: settings.currentUser.created_at,
                        last_login_at: settings.currentUser.last_login_at
                    }}
                >
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
                            setIsSaving(false);
                        }}
                        formRef={formRef}
                        hideAction={true}
                    />
                </SplitSettingsLayout>
            </div>
        </AdminLayout>
    );
}
