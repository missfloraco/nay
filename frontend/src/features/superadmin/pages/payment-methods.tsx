import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, CreditCard, Wallet, Landmark, Globe, ToggleLeft, ToggleRight, Lock, Globe as GlobeIcon } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useAction } from '@/shared/contexts/action-context';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import { logger } from '@/shared/services/logger';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';

export default function PaymentMethods() {
    const { settings, updateSettings } = useSettings();
    const { showSuccess, showError } = useNotifications();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        bank_transfer_enabled: settings.bank_transfer_enabled === true || settings.bank_transfer_enabled === 'true',
        bank_transfer_details: settings.bank_transfer_details || '',
        paypal_enabled: settings.paypal_enabled === true || settings.paypal_enabled === 'true',
        paypal_client_id: settings.paypal_client_id || '',
        paypal_secret: settings.paypal_secret || '',
        crypto_enabled: settings.crypto_enabled === true || settings.crypto_enabled === 'true',
        crypto_details: settings.crypto_details || '',
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await SettingsService.updateSettings('admin', formData);
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
            label: saving ? 'جاري الحفظ...' : 'حفظ إعدادات طرق الدفع',
            type: 'submit',
            form: 'payment-settings-form',
            icon: Save,
            loading: saving,
            variant: 'primary'
        });
        return () => setPrimaryAction(null);
    }, [saving, formData, setPrimaryAction]);

    const toggleField = (field: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <AdminLayout title="إعدادات طرق الدفع" icon={CreditCard} noPadding={true}>
            <form id="payment-settings-form" onSubmit={handleSubmit} className="w-full bg-transparent animate-in fade-in duration-500">
                <div className="space-y-8 w-full p-4 md:p-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 md:gap-6 group">
                            <div className="p-3 md:p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl md:rounded-[2rem] text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">إدارة طرق الدفع</h3>
                                <p className="text-sm md:text-base font-bold text-gray-400 dark:text-gray-500">تفعيل وتكوين بوابات الدفع المتاحة</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                        {/* PayPal Integration */}
                        <div className="premium-card p-6 md:p-8 xl:p-10 transition-all hover:shadow-2xl group/card bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-50 dark:border-white/5 pb-6 transition-colors group-hover/card:border-blue-500/20">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="p-3 md:p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover/card:-rotate-6 transition-all duration-500">
                                        <Globe className="w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">PayPal</h3>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1 md:mt-2">الدفع الإلكتروني العالمي</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleField('paypal_enabled')}
                                    className={`flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 h-10 md:h-12 rounded-xl font-bold transition-all text-sm ${formData.paypal_enabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                                >
                                    {formData.paypal_enabled ? <ToggleRight className="w-5 h-5 md:w-6 md:h-6" /> : <ToggleLeft className="w-5 h-5 md:w-6 md:h-6" />}
                                    <span>{formData.paypal_enabled ? 'مفعل' : 'معطل'}</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <InputField
                                    label="Client ID (المعرف)"
                                    value={formData.paypal_client_id}
                                    onChange={e => setFormData({ ...formData, paypal_client_id: e.target.value })}
                                    placeholder="أدخل PayPal Client ID"
                                    icon={GlobeIcon}
                                    className="ltr"
                                />
                                <InputField
                                    type="password"
                                    label="Secret Key (المفتاح السري)"
                                    value={formData.paypal_secret}
                                    onChange={e => setFormData({ ...formData, paypal_secret: e.target.value })}
                                    placeholder="أدخل PayPal Secret Key"
                                    icon={Lock}
                                    className="ltr"
                                />
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className="premium-card p-6 md:p-8 xl:p-10 transition-all hover:shadow-2xl group/card bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-50 dark:border-white/5 pb-6 transition-colors group-hover/card:border-amber-500/20">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="p-3 md:p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover/card:-rotate-12 transition-all duration-500">
                                        <Landmark className="w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">تحويل بنكي</h3>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1 md:mt-2">الدفع اليدوي عبر البنوك</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleField('bank_transfer_enabled')}
                                    className={`flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 h-10 md:h-12 rounded-xl font-bold transition-all text-sm ${formData.bank_transfer_enabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                                >
                                    {formData.bank_transfer_enabled ? <ToggleRight className="w-5 h-5 md:w-6 md:h-6" /> : <ToggleLeft className="w-5 h-5 md:w-6 md:h-6" />}
                                    <span>{formData.bank_transfer_enabled ? 'مفعل' : 'معطل'}</span>
                                </button>
                            </div>

                            <TextareaField
                                label="تفاصيل الحسابات البنكية"
                                value={formData.bank_transfer_details}
                                onChange={e => setFormData({ ...formData, bank_transfer_details: e.target.value })}
                                placeholder="اكتب اسم البنك، رقم الآيبان (IBAN)، واسم المستفيد..."
                                icon={Landmark}
                                className="min-h-[160px]"
                            />
                        </div>

                        {/* Cryptocurrency */}
                        <div className="premium-card p-6 md:p-8 xl:p-10 transition-all hover:shadow-2xl group/card bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-white/5 xl:col-span-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-50 dark:border-white/5 pb-6 transition-colors group-hover/card:border-orange-500/20">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="p-3 md:p-4 rounded-3xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover/card:rotate-6 transition-all duration-500">
                                        <Wallet className="w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">العملات الرقمية</h3>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1 md:mt-2">الدفع عبر شبكات البلوكشين (Crypto)</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleField('crypto_enabled')}
                                    className={`flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 h-10 md:h-12 rounded-xl font-bold transition-all text-sm ${formData.crypto_enabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                                >
                                    {formData.crypto_enabled ? <ToggleRight className="w-5 h-5 md:w-6 md:h-6" /> : <ToggleLeft className="w-5 h-5 md:w-6 md:h-6" />}
                                    <span>{formData.crypto_enabled ? 'مفعل' : 'معطل'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="order-2 xl:order-1">
                                    <TextareaField
                                        label="عناوين المحافظ وتفاصيل الدفع"
                                        value={formData.crypto_details}
                                        onChange={e => setFormData({ ...formData, crypto_details: e.target.value })}
                                        placeholder="USDT (TRC20): Txxxxxxxx...&#10;BTC: 1xxxxxxx..."
                                        icon={Wallet}
                                        className="min-h-[160px]"
                                    />
                                </div>
                                <div className="order-1 xl:order-2 flex flex-col justify-center items-start bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl p-6 border border-orange-100 dark:border-white/5">
                                    <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">ملاحظة هامة</h4>
                                    <p className="text-sm text-orange-700/80 dark:text-orange-300/70 leading-relaxed">
                                        تأكد من كتابة عناوين المحافظ بدقة عالية وتحديد الشبكة (Network) لكل عملة لتجنب فقدان الأموال أثناء التحويل. يفضل دائماً توضيح الخطوات للمستخدم.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
