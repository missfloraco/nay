import React, { useState, useEffect } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Save, CreditCard, Wallet, Landmark, Globe, ToggleLeft, ToggleRight, ShieldCheck, Zap, Plus, X, Search, Calendar, DollarSign, User as UserIcon, Key, Lock, Globe as GlobeIcon } from 'lucide-react';
import { useSettings } from '@/shared/contexts/app-context';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import { useAction } from '@/shared/contexts/action-context';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import { SettingsService } from '@/shared/services/settingsservice';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { RecordPaymentModal } from '@/features/superadmin/components/record-payment-modal';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';
import SelectField from '@/shared/ui/forms/select-field';

export default function PaymentManagement() {
    const { settings, updateSettings } = useSettings();
    const { showToast } = useToast();
    const { setPrimaryAction } = useAction();
    const [saving, setSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [formData, setFormData] = useState({
        bank_transfer_enabled: settings.bank_transfer_enabled === true || settings.bank_transfer_enabled === 'true',
        bank_transfer_details: settings.bank_transfer_details || '',
        stripe_enabled: settings.stripe_enabled === true || settings.stripe_enabled === 'true',
        stripe_key: settings.stripe_key || '',
        stripe_secret: settings.stripe_secret || '',
        paypal_enabled: settings.paypal_enabled === true || settings.paypal_enabled === 'true',
        paypal_client_id: settings.paypal_client_id || '',
        paypal_secret: settings.paypal_secret || '',
        dodopayments_enabled: settings.dodopayments_enabled === true || settings.dodopayments_enabled === 'true',
        dodopayments_api_key: settings.dodopayments_api_key || '',
        dodopayments_webhook_secret: settings.dodopayments_webhook_secret || '',
        dodopayments_mode: settings.dodopayments_mode || 'test',
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await SettingsService.updateSettings('admin', formData);
            await updateSettings({});
            showToast(TEXTS_ADMIN.MESSAGES.SUCCESS, 'success');
        } catch (error) {
            logger.error(error);
            showToast(TEXTS_ADMIN.MESSAGES.ERROR, 'error');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setPrimaryAction({
            label: saving ? 'جاري الحفظ...' : 'حفظ إعدادات طرق الدفع',
            onClick: () => handleSubmit(),
            icon: Save,
            loading: saving,
            variant: 'primary'
        });
        return () => setPrimaryAction(null);
    }, [saving, formData]);

    const toggleField = (field: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <AdminLayout title="إدارة طرق الدفع والتكامل" noPadding={true}>
            <div className="h-full w-full bg-white dark:bg-dark-950 p-10 animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-20">
                <div className="space-y-12 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-dark-800 pb-8">
                        <div className="flex items-center gap-6 group">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">إدارة طرق الدفع</h3>
                                <p className="text-base font-bold text-gray-400 dark:text-gray-500">تفعيل وتكوين بوابات الدفع الإلكتروني</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center justify-center gap-3 px-8 h-14 bg-white dark:bg-dark-900 border-2 border-dashed border-gray-200 dark:border-dark-700 hover:border-emerald-500 text-gray-700 dark:text-gray-300 hover:text-emerald-500 rounded-2xl font-black transition-all shadow-sm hover:shadow-xl active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                            <span>تسجيل دفعة يدوية</span>
                        </button>
                    </div>

                    {showPaymentModal && (
                        <RecordPaymentModal
                            onClose={() => setShowPaymentModal(false)}
                            onSuccess={() => {
                                // Optionally refresh stats or list if we had one here
                            }}
                        />
                    )}

                    {/* Stripe Integration */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-indigo-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover/card:rotate-6 transition-all duration-500">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">تكامل Stripe</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">قبول المدفوعات عبر البطاقات الائتمانية عالمياً</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleField('stripe_enabled')}
                                className={`flex items-center gap-4 px-8 h-14 rounded-2xl font-black transition-all ${formData.stripe_enabled ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                            >
                                {formData.stripe_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                <span>{formData.stripe_enabled ? 'مفعل' : 'معطل'}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <InputField
                                label="Stripe Publishable Key"
                                value={formData.stripe_key}
                                onChange={e => setFormData({ ...formData, stripe_key: e.target.value })}
                                placeholder="pk_test_..."
                                icon={Key}
                                className="ltr"
                            />
                            <InputField
                                type="password"
                                label="Stripe Secret Key"
                                value={formData.stripe_secret}
                                onChange={e => setFormData({ ...formData, stripe_secret: e.target.value })}
                                placeholder="sk_test_..."
                                icon={Lock}
                                className="ltr"
                            />
                        </div>
                    </div>

                    {/* PayPal Integration */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-blue-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover/card:-rotate-6 transition-all duration-500">
                                    <Globe className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">تكامل PayPal</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">تفعيل الدفع عبر حسابات PayPal العالمية</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleField('paypal_enabled')}
                                className={`flex items-center gap-4 px-8 h-14 rounded-2xl font-black transition-all ${formData.paypal_enabled ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                            >
                                {formData.paypal_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                <span>{formData.paypal_enabled ? 'مفعل' : 'معطل'}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <InputField
                                label="PayPal Client ID"
                                value={formData.paypal_client_id}
                                onChange={e => setFormData({ ...formData, paypal_client_id: e.target.value })}
                                placeholder="Client ID"
                                icon={GlobeIcon}
                                className="ltr"
                            />
                            <InputField
                                type="password"
                                label="PayPal Secret Key"
                                value={formData.paypal_secret}
                                onChange={e => setFormData({ ...formData, paypal_secret: e.target.value })}
                                placeholder="Secret Key"
                                icon={Lock}
                                className="ltr"
                            />
                        </div>
                    </div>

                    {/* DodoPayments Integration */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-orange-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover/card:rotate-12 transition-all duration-500">
                                    <Zap className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">تكامل DodoPayments</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">بوابة دفع محلية وعالمية متطورة</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleField('dodopayments_enabled')}
                                className={`flex items-center gap-4 px-8 h-14 rounded-2xl font-black transition-all ${formData.dodopayments_enabled ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                            >
                                {formData.dodopayments_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                <span>{formData.dodopayments_enabled ? 'مفعل' : 'معطل'}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <InputField
                                label="API Key"
                                value={formData.dodopayments_api_key}
                                onChange={e => setFormData({ ...formData, dodopayments_api_key: e.target.value })}
                                placeholder="Dodo API Key"
                                icon={Key}
                                className="ltr"
                            />
                            <InputField
                                label="Webhook Secret"
                                value={formData.dodopayments_webhook_secret}
                                onChange={e => setFormData({ ...formData, dodopayments_webhook_secret: e.target.value })}
                                placeholder="Webhook Secret"
                                icon={Lock}
                                className="ltr"
                            />
                            <SelectField
                                label="بيئة الدفع"
                                value={formData.dodopayments_mode}
                                onChange={e => setFormData({ ...formData, dodopayments_mode: e.target.value as 'test' | 'live' })}
                                icon={Zap}
                                options={[
                                    { value: 'test', label: 'بيئة التجربة (Test)' },
                                    { value: 'live', label: 'البيئة الحية (Live)' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="premium-card p-12 transition-all hover:shadow-2xl group/card">
                        <div className="flex items-center justify-between gap-6 mb-12 border-b border-gray-50 dark:border-white/5 pb-8 transition-colors group-hover/card:border-amber-500/20">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover/card:-rotate-12 transition-all duration-500">
                                    <Landmark className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">الحوالات البنكية</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-base font-medium mt-2">توفير تفاصيل الحسابات البنكية للتحويل اليدوي</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleField('bank_transfer_enabled')}
                                className={`flex items-center gap-4 px-8 h-14 rounded-2xl font-black transition-all ${formData.bank_transfer_enabled ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-gray-100 dark:bg-dark-800 text-gray-400'}`}
                            >
                                {formData.bank_transfer_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                <span>{formData.bank_transfer_enabled ? 'مفعل' : 'معطل'}</span>
                            </button>
                        </div>

                        <TextareaField
                            label="تفاصيل الحسابات البنكية"
                            value={formData.bank_transfer_details}
                            onChange={e => setFormData({ ...formData, bank_transfer_details: e.target.value })}
                            placeholder="اكتب تفاصيل البنك، رقم الحساب، و الـ IBAN..."
                            icon={Landmark}
                            className="min-h-[224px]"
                        />
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
