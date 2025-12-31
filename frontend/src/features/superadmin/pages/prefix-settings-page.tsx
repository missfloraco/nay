import React, { useEffect, useState } from 'react';
import { Hash, Save } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { PrefixSettings } from '@/features/superadmin/components/prefix-settings';
import { useSettings } from '@/shared/contexts/app-context';
import { useAction } from '@/shared/contexts/action-context';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';

export default function PrefixSettingsPage() {
    const { settings, updateLocalSettings, loading } = useSettings();
    const { setPrimaryAction } = useAction();
    const { showToast } = useFeedback();
    const [isSaving, setIsSaving] = useState(false);
    const [localPrefixes, setLocalPrefixes] = useState<any>({});

    useEffect(() => {
        if (settings.branding) {
            setLocalPrefixes({
                prefix_admin: settings.branding.prefix_admin,
                prefix_tenant: settings.branding.prefix_tenant,
                prefix_ticket: settings.branding.prefix_ticket,
                prefix_payment: settings.branding.prefix_payment,
                prefix_ad: settings.branding.prefix_ad,
            });
        }
    }, [settings.branding]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/admin/settings', localPrefixes);

            updateLocalSettings({
                branding: {
                    ...settings.branding,
                    ...localPrefixes
                }
            });

            showToast('تم حفظ إعدادات التسميات بنجاح', 'success');
        } catch (error) {
            console.error('Save failed', error);
            showToast('حدث خطأ أثناء حفظ الإعدادات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        setPrimaryAction({
            label: isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات',
            icon: Save,
            onClick: handleSave,
            loading: isSaving,
            disabled: isSaving
        });
        return () => setPrimaryAction(null);
    }, [setPrimaryAction, isSaving, localPrefixes]);

    if (loading) return null;

    return (
        <AdminLayout title="نظام التسميات" icon={Hash}>
            <div className="w-full max-w-4xl mx-auto py-12">
                <PrefixSettings
                    settings={localPrefixes}
                    onChange={(key, value) => setLocalPrefixes(prev => ({ ...prev, [key]: value }))}
                />
            </div>
        </AdminLayout>
    );
}
