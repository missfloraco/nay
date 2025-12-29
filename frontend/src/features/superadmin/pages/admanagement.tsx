import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, Megaphone, Shield, ShieldAlert } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { useAction } from '@/shared/contexts/action-context';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import { AdsService } from '@/shared/services/adsservice';
import { logger } from '@/shared/services/logger';
import AdsTable from '@/features/superadmin/components/adstable';

export default function AdManagement() {
    const { settings, updateSettings } = useSettings();
    const { showSuccess, showError } = useFeedback();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    const [adsData, setAdsData] = useState({
        adblock_enabled: settings.adblock_enabled === 'true' || settings.adblock_enabled === true || settings.adblock_enabled === '1' || settings.adblock_enabled === 1,
    });

    // Sync local state when settings refresh
    useEffect(() => {
        setAdsData({
            adblock_enabled: settings.adblock_enabled === 'true' || settings.adblock_enabled === true || settings.adblock_enabled === '1' || settings.adblock_enabled === 1,
        });
    }, [settings.adblock_enabled]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            // Updated to use the new AdsService toggle which saves to 'ads' table
            await AdsService.toggleAdBlock(adsData.adblock_enabled);
            await updateSettings({});
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
        } catch (error) {
            logger.error(error);
            showError(TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPrimaryAction({
            label: saving ? 'جاري الحفظ...' : 'حفظ الإعدادات',
            onClick: () => handleSubmit(),
            icon: Save,
            loading: saving,
            variant: 'primary'
        });
        return () => setPrimaryAction(null);
    }, [saving, adsData]);

    return (
        <AdminLayout title="إدارة الإعلانات">
            <div className="h-full flex flex-col p-6 space-y-12 animate-in fade-in duration-700">

                {/* 1. Ads Table at the top */}
                <div className="flex-1 flex flex-col">
                    <AdsTable />
                </div>

                {/* 2. AdBlock Detection Settings at the bottom */}
                <div className="premium-card p-12 transition-all hover:shadow-2xl group/card border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8">
                        <div className="p-4 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover/card:scale-110 transition-transform duration-500">
                            <Megaphone className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{TEXTS_ADMIN.SETTINGS.ADBLOCK_DETECTION}</h3>
                            <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">{TEXTS_ADMIN.SETTINGS.ADBLOCK_DESC}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-10 bg-white dark:bg-dark-800/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-500">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <label className="text-xl font-bold text-gray-900 dark:text-white">
                                    {TEXTS_ADMIN.SETTINGS.ADBLOCK_ENABLED}
                                </label>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter font-black transition-all duration-500 ${adsData.adblock_enabled ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-dark-700 text-gray-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${adsData.adblock_enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    {adsData.adblock_enabled ? 'مفعل وقيد التشغيل' : 'معطل حالياً'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                                تفعيل خاصية الكشف الإلزامي تمنع المستخدمين من الوصول للمحتوى إلا بعد تعطيل مانع الإعلانات، مما يضمن استمرارية دعم المنصة وزيادة عوائد الإعلانات.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={async () => {
                                    const newValue = !adsData.adblock_enabled;
                                    setAdsData({ ...adsData, adblock_enabled: newValue });
                                    setSaving(true);
                                    try {
                                        await AdsService.toggleAdBlock(newValue);
                                        await updateSettings({}); // Refresh global state
                                        showSuccess("تم التحديث تلقائياً بنجاح");
                                    } catch (error) {
                                        setAdsData({ ...adsData, adblock_enabled: !newValue }); // Rollback
                                        showError("فشل التحديث التلقائي");
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 shadow-xl group hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${adsData.adblock_enabled
                                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30'
                                    : 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-dark-600 shadow-gray-200/20'
                                    }`}
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Shield className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-12 ${adsData.adblock_enabled ? 'text-white' : 'text-primary'}`} />
                                )}
                                {adsData.adblock_enabled ? (
                                    <span>إيقاف التشغيل الفوري</span>
                                ) : (
                                    <span>تفعيل الكاشف (حفظ تلقائي)</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
