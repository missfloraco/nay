import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Shield, Star, Crown, Sparkles, Save } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useNotifications } from '@/shared/contexts/notification-context';
import Modal from '@/shared/ui/modals/modal';
import InputField from '@/shared/ui/forms/input-field';
import { useAction } from '@/shared/contexts/action-context';
import { useEffect } from 'react';
import { useSettings } from '@/shared/contexts/app-context';

const PLAN_ICONS = {
    'الباقة الأساسية': Shield,
    'الباقة الاحترافية': Star,
    'الباقة المتقدمة': Crown,
    'Default': Star
};

export default function AdminPlansPage() {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [billingType, setBillingType] = useState<'recurring' | 'lifetime' | 'fixed_term'>('recurring');
    const [discount, setDiscount] = useState<number>(0);
    const [tempMonthlyPrice, setTempMonthlyPrice] = useState<string>('');
    const [tempYearlyPrice, setTempYearlyPrice] = useState<string>('');
    const [tempLifetimePrice, setTempLifetimePrice] = useState<string>('');
    const [tempFixedPrice, setTempFixedPrice] = useState<string>('');
    const [fixedDuration, setFixedDuration] = useState<string>('1');
    const [fixedUnit, setFixedUnit] = useState<'months' | 'years'>('years');
    const { setPrimaryAction } = useAction();
    const { settings, refreshSettings } = useSettings();
    const [trialDays, setTrialDays] = useState(settings?.trial_period_days || 7);
    const [isSavingTrial, setIsSavingTrial] = useState(false);

    useEffect(() => {
        if (settings?.trial_period_days !== undefined) {
            setTrialDays(settings.trial_period_days);
        }
    }, [settings?.trial_period_days]);

    const handleSaveTrial = async () => {
        setIsSavingTrial(true);
        try {
            await api.post('/admin/settings', { trial_period_days: trialDays });
            await refreshSettings();
            showSuccess('تم تحديث الفترة التجريبية بنجاح');
        } catch (error) {
            showError('فشل تحديث الفترة التجريبية');
        } finally {
            setIsSavingTrial(false);
        }
    };

    const { data: plansData, isLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => api.get('/admin/plans')
    });

    const plans = (plansData as any)?.plans || [];

    const saveMutation = useMutation({
        mutationFn: (data: any) => editingPlan
            ? api.put(`/admin/plans/${editingPlan.id}`, data)
            : api.post('/admin/plans', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            showSuccess('تم حفظ الخطة بنجاح');
            setIsModalOpen(false);
            setEditingPlan(null);
        }
    });

    const handleDelete = async (id: number) => {
        const plan = plans.find((p: any) => p.id === id);
        if (!plan) return;

        try {
            // Optimistic update
            queryClient.setQueryData(['admin-plans'], (old: any) => ({
                ...old,
                plans: old.plans.filter((p: any) => p.id !== id)
            }));

            await api.delete(`/admin/plans/${id}`);

            showSuccess(`تم نقل "${plan.name}" إلى سلة المحذوفات`, {
                action: {
                    label: 'تراجع',
                    onClick: async () => {
                        try {
                            await api.post(`/admin/plans/${id}/restore`);
                            showSuccess(`تم استعادة "${plan.name}" بنجاح`);
                            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
                        } catch (err) {
                            showError('فشل استعادة الخطة');
                            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
                        }
                    }
                }
            });
        } catch (error) {
            showError('فشل حذف الخطة');
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        }
    };

    const handleOpenModal = (plan: any = null) => {
        setEditingPlan(plan);
        if (plan) {
            setBillingType(plan.billing_type || 'recurring');
            setTempMonthlyPrice(plan.monthly_price?.toString() || '');
            setTempYearlyPrice(plan.yearly_price?.toString() || '');
            setTempLifetimePrice(plan.lifetime_price?.toString() || '');
            setTempFixedPrice(plan.fixed_term_price?.toString() || '');
            setFixedDuration(plan.fixed_term_duration?.toString() || '1');
            setFixedUnit(plan.fixed_term_unit || 'years');

            const monthlyTotal = (plan.monthly_price || 0) * 12;
            const currentDiscount = monthlyTotal > 0 ? Math.round((1 - (plan.yearly_price / monthlyTotal)) * 100) : 0;
            setDiscount(currentDiscount);
        } else {
            setBillingType('recurring');
            setTempMonthlyPrice('');
            setTempYearlyPrice('');
            setTempLifetimePrice('');
            setTempFixedPrice('');
            setFixedDuration('1');
            setFixedUnit('years');
            setDiscount(20);
        }
        setIsModalOpen(true);
    };

    const handleDiscountChange = (percentage: number) => {
        setDiscount(percentage);
        const monthly = parseFloat(tempMonthlyPrice);
        if (!isNaN(monthly)) {
            const calculatedYearly = (monthly * 12) * (1 - (percentage / 100));
            setTempYearlyPrice(calculatedYearly.toFixed(2));
        }
    };

    const handleMonthlyChange = (val: string) => {
        setTempMonthlyPrice(val);
        const monthly = parseFloat(val);
        if (!isNaN(monthly)) {
            const calculatedYearly = (monthly * 12) * (1 - (discount / 100));
            setTempYearlyPrice(calculatedYearly.toFixed(2));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            billing_type: billingType,
            monthly_price: billingType === 'recurring' ? tempMonthlyPrice : null,
            yearly_price: billingType === 'recurring' ? tempYearlyPrice : null,
            lifetime_price: billingType === 'lifetime' ? tempLifetimePrice : null,
            fixed_term_price: billingType === 'fixed_term' ? tempFixedPrice : null,
            fixed_term_duration: billingType === 'fixed_term' ? fixedDuration : null,
            fixed_term_unit: billingType === 'fixed_term' ? fixedUnit : null,

            offer_monthly_price: formData.get('offer_monthly_price') || null,
            offer_yearly_price: formData.get('offer_yearly_price') || null,
            offer_lifetime_price: formData.get('offer_lifetime_price') || null,
            offer_fixed_term_price: formData.get('offer_fixed_term_price') || null,

            offer_start: formData.get('offer_start') || null,
            offer_end: formData.get('offer_end') || null,
            currency: 'USD',
            is_active: true,
            features: (formData.get('features') as string).split('\n').filter(f => f.trim())
        };
        saveMutation.mutate(data);
    };

    useEffect(() => {
        if (isModalOpen) {
            setPrimaryAction({
                label: editingPlan ? 'حفظ التعديلات النهائية' : 'إنشاء ونشر الخطة الآن',
                icon: Check,
                type: 'submit',
                form: 'plan-form',
                loading: saveMutation.isPending,
                secondaryAction: {
                    label: 'تجاهل',
                    onClick: () => setIsModalOpen(false)
                }
            });
        } else {
            setPrimaryAction({
                label: 'إضافة خطة جديدة',
                icon: Plus,
                onClick: () => handleOpenModal(),
            });
        }
        return () => setPrimaryAction(null);
    }, [isModalOpen, editingPlan, saveMutation.isPending, setPrimaryAction]);

    return (
        <AdminLayout title="إدارة الخطط السعرية" icon={Crown}>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">الخطط المتاحة</h2>
                        <p className="text-sm text-gray-400 font-bold">كافة المميزات مفتوحة لجميع الخطط. الفروقات تكمن في السعر، المدة، ومستوى الخدمة.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-premium mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">إعدادات الفترة التجريبية</h3>
                                <p className="text-sm font-bold text-gray-400">حدد عدد الأيام التجريبية الافتراضية للمشتركين الجدد</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32">
                                <InputField
                                    label="عدد الأيام"
                                    type="number"
                                    value={trialDays}
                                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                                    className="text-center font-black !text-lg !py-4"
                                    min={0}
                                    max={365}
                                />
                            </div>
                            <button
                                onClick={handleSaveTrial}
                                disabled={isSavingTrial || trialDays === settings?.trial_period_days}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Save className="w-5 h-4" />
                                {isSavingTrial ? 'جاري الحفظ...' : 'حفظ الإعداد'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan: any) => {
                        const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || PLAN_ICONS.Default;
                        return (
                            <div key={plan.id} className="group relative bg-white dark:bg-dark-900 p-8 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                                    <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl transition-all duration-300">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                                            title="تعديل الخطة"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-0.5" />
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="p-2.5 bg-red-500/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300"
                                            title="حذف الخطة"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-primary/10 rounded-[var(--radius-inner)] flex items-center justify-center mb-6">
                                    <Icon className="w-8 h-8 text-primary" />
                                </div>

                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{plan.name}</h3>

                                <div className="space-y-4 mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 min-h-[160px] flex flex-col justify-center">
                                    {plan.billing_type === 'lifetime' ? (
                                        <div className="text-center space-y-2">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">دفع لمرة واحدة (مدى الحياة)</span>
                                            <div className="flex flex-col items-center">
                                                {plan.offer_lifetime_price && (
                                                    <span className="text-sm text-gray-400 line-through opacity-50">${Math.round(plan.lifetime_price)}</span>
                                                )}
                                                <span className="text-4xl font-black text-primary">
                                                    ${Math.round(plan.offer_lifetime_price || plan.lifetime_price)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : plan.billing_type === 'fixed_term' ? (
                                        <div className="text-center space-y-2">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">دفع لمرة واحدة ({plan.fixed_term_duration} {plan.fixed_term_unit === 'years' ? 'سنة' : 'شهر'})</span>
                                            <div className="flex flex-col items-center">
                                                {plan.offer_fixed_term_price && (
                                                    <span className="text-sm text-gray-400 line-through opacity-50">${Math.round(plan.fixed_term_price)}</span>
                                                )}
                                                <span className="text-4xl font-black text-primary">
                                                    ${Math.round(plan.offer_fixed_term_price || plan.fixed_term_price)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-black uppercase tracking-widest">شهرياً</span>
                                                <div className="text-right">
                                                    {plan.offer_monthly_price && (
                                                        <span className="text-[10px] text-gray-400 line-through block opacity-50">${Math.round(plan.monthly_price)}</span>
                                                    )}
                                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                        ${Math.round(plan.offer_monthly_price || plan.monthly_price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
                                                <span className="text-xs text-gray-400 font-black uppercase tracking-widest">سنوياً</span>
                                                <div className="text-right">
                                                    {plan.offer_yearly_price && (
                                                        <span className="text-[10px] text-gray-400 line-through block opacity-50">${Math.round(plan.yearly_price)}</span>
                                                    )}
                                                    <span className="text-2xl font-black text-primary">
                                                        ${Math.round(plan.offer_yearly_price || plan.yearly_price)}
                                                    </span>
                                                    <p className="text-[10px] text-emerald-500 font-bold">توفير {Math.round((1 - ((plan.offer_yearly_price || plan.yearly_price) / ((plan.offer_monthly_price || plan.monthly_price) * 12))) * 100)}%</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {(plan.offer_start || plan.offer_end) && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-white/10">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                                                <Sparkles className="w-3 h-3" />
                                                عرض مجدول: {plan.offer_start ? new Date(plan.offer_start).toLocaleDateString('ar-EG') : '...'} - {plan.offer_end ? new Date(plan.offer_end).toLocaleDateString('ar-EG') : '...'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative group/features">
                                    {/* Scroll indicators */}
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-dark-900 to-transparent z-10 pointer-events-none opacity-0 group-hover/features:opacity-100 transition-opacity" />

                                    <div className="space-y-4 pt-6 pb-6 border-t border-gray-50 dark:border-white/5 overflow-y-auto custom-scrollbar max-h-[150px] pr-2">
                                        {plan.features?.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                </div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-dark-900 to-transparent z-10 pointer-events-none opacity-40 group-hover/features:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}
                variant="content-fit"
            >
                <form
                    id="plan-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Right Column: Basic Info & Pricing */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h5 className="text-lg font-black text-gray-900 dark:text-white">البيانات الأساسية</h5>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <InputField
                                        label="اسم الخطة"
                                        name="name"
                                        defaultValue={editingPlan?.name}
                                        required
                                        placeholder="مثلاً: الباقة الاحترافية"
                                        className="bg-gray-50/50"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">نوع الاشتراك</label>
                                    <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-100 dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-white/5">
                                        {[
                                            { id: 'recurring', label: 'دوري (شهري/سنوي)' },
                                            { id: 'lifetime', label: 'مدى الحياة' },
                                            { id: 'fixed_term', label: 'مدة محددة' }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setBillingType(type.id as any)}
                                                className={`px-4 py-3 rounded-xl font-black text-[11px] transition-all ${billingType === type.id
                                                    ? 'bg-white dark:bg-dark-900 text-primary shadow-lg'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {billingType === 'recurring' && (
                                    <div className="space-y-6">
                                        <div className="space-y-6 p-8 bg-gray-50/50 dark:bg-dark-800/40 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">توفير الدفع السنوي</label>
                                                </div>
                                                <div className="px-4 py-2 bg-primary/10 rounded-2xl">
                                                    <span className="text-xl font-black text-primary">{discount}%</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="50" step="5"
                                                value={discount}
                                                onChange={(e) => handleDiscountChange(parseInt(e.target.value))}
                                                className="w-full h-2.5 bg-gray-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField
                                                label="السعر الشهري ($)"
                                                type="number"
                                                step="0.01"
                                                value={tempMonthlyPrice}
                                                onChange={(e) => handleMonthlyChange(e.target.value)}
                                                required
                                                className="bg-white dark:bg-dark-900"
                                            />
                                            <InputField
                                                label="السعر السنوي ($)"
                                                type="number"
                                                step="0.01"
                                                value={tempYearlyPrice}
                                                onChange={(e) => setTempYearlyPrice(e.target.value)}
                                                required
                                                className="bg-primary/5 border-primary/20 text-primary font-black"
                                            />
                                        </div>
                                    </div>
                                )}

                                {billingType === 'lifetime' && (
                                    <div className="p-8 bg-gray-50/50 dark:bg-dark-800/40 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5">
                                        <InputField
                                            label="سعر مدى الحياة ($)"
                                            type="number"
                                            step="0.01"
                                            value={tempLifetimePrice}
                                            onChange={(e) => setTempLifetimePrice(e.target.value)}
                                            required
                                            placeholder="مثلاً: 499"
                                            className="bg-white dark:bg-dark-900 !text-2xl h-16 font-black text-center"
                                        />
                                        <p className="text-[10px] font-bold text-gray-400 mt-4 text-center">أدخل المبلغ الإجمالي الذي سيدفعه العميل مرة واحدة للحصول على وصول دائم.</p>
                                    </div>
                                )}

                                {billingType === 'fixed_term' && (
                                    <div className="space-y-6 p-8 bg-gray-50/50 dark:bg-dark-800/40 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="المدة"
                                                type="number"
                                                value={fixedDuration}
                                                onChange={(e) => setFixedDuration(e.target.value)}
                                                required
                                                min="1"
                                                className="bg-white dark:bg-dark-900"
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الوحدة</label>
                                                <select
                                                    value={fixedUnit}
                                                    onChange={(e) => setFixedUnit(e.target.value as any)}
                                                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/5 font-bold outline-none"
                                                >
                                                    <option value="years">سنة/سنوات</option>
                                                    <option value="months">شهر/شهور</option>
                                                </select>
                                            </div>
                                        </div>
                                        <InputField
                                            label="سعر المدة الإجمالي ($)"
                                            type="number"
                                            step="0.01"
                                            value={tempFixedPrice}
                                            onChange={(e) => setTempFixedPrice(e.target.value)}
                                            required
                                            className="bg-white dark:bg-dark-900 !text-2xl h-16 font-black text-center"
                                        />
                                    </div>
                                )}

                                {/* Unified Special Offer Section */}
                                <div className="space-y-6 p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[var(--radius-card)] border border-blue-100 dark:border-blue-900/20 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                        <h5 className="text-lg font-black text-gray-900 dark:text-white">عرض خاص (لفترة محدودة)</h5>
                                    </div>

                                    {billingType === 'recurring' ? (
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField
                                                label="سعر العرض الشهري ($)"
                                                name="offer_monthly_price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={editingPlan?.offer_monthly_price}
                                                placeholder="سعر مخفض..."
                                                className="bg-white dark:bg-dark-900"
                                            />
                                            <InputField
                                                label="سعر العرض السنوي ($)"
                                                name="offer_yearly_price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={editingPlan?.offer_yearly_price}
                                                placeholder="سعر مخفض..."
                                                className="bg-white dark:bg-dark-900"
                                            />
                                        </div>
                                    ) : billingType === 'lifetime' ? (
                                        <InputField
                                            label="سعر العرض لمدى الحياة ($)"
                                            name="offer_lifetime_price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingPlan?.offer_lifetime_price}
                                            placeholder="سعر العرض..."
                                            className="bg-white dark:bg-dark-900"
                                        />
                                    ) : (
                                        <InputField
                                            label="سعر العرض للمدة المحددة ($)"
                                            name="offer_fixed_term_price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingPlan?.offer_fixed_term_price}
                                            placeholder="سعر العرض..."
                                            className="bg-white dark:bg-dark-900"
                                        />
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">تاريخ بدء العرض</label>
                                            <input
                                                type="datetime-local"
                                                name="offer_start"
                                                defaultValue={editingPlan?.offer_start ? new Date(editingPlan.offer_start).toISOString().slice(0, 16) : ''}
                                                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/5 font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">تاريخ انتهاء العرض</label>
                                            <input
                                                type="datetime-local"
                                                name="offer_end"
                                                defaultValue={editingPlan?.offer_end ? new Date(editingPlan.offer_end).toISOString().slice(0, 16) : ''}
                                                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/5 font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Features */}
                        <div className="space-y-8 flex flex-col h-full">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    <h5 className="text-lg font-black text-gray-900 dark:text-white">مستوى الخدمة والمزايا المضافة</h5>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">نقاط البيع</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col space-y-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[var(--radius-inner)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <textarea
                                        name="features"
                                        rows={8}
                                        defaultValue={editingPlan?.features?.join('\n')}
                                        className="w-full h-full p-8 bg-gray-50/50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 rounded-[var(--radius-inner)] font-bold text-gray-700 dark:text-gray-200 outline-none transition-all resize-none shadow-inner relative z-10 custom-scrollbar leading-relaxed"
                                        placeholder="دعم فني ذو أولوية&#10;مدير حساب مخصص&#10;خدمة التركيب والتدريب&#10;..."
                                    ></textarea>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-2xl flex gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                                        ملاحظة: كافة مميزات النظام (التقارير، المخزون، إلخ) متاحة تلقائياً لجميع الخطط. استخدم هذه القائمة لتعريف مستوى الخدمة أو المزايا التسويقية الخاصة بكل فئة.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Local footer removed - Actions are now in global toolbar */}
                </form>
            </Modal>
        </AdminLayout >
    );
}
