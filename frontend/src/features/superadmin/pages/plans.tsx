import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Shield, Star, Crown } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Modal from '@/shared/ui/modals/modal';
import InputField from '@/shared/ui/forms/input-field';
import { useAction } from '@/shared/contexts/action-context';
import { useEffect } from 'react';

const PLAN_ICONS = {
    'الباقة الأساسية': Shield,
    'الباقة الاحترافية': Star,
    'الباقة المتقدمة': Crown,
    'Default': Star
};

export default function AdminPlansPage() {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useFeedback();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [tempMonthlyPrice, setTempMonthlyPrice] = useState<string>('');
    const [tempYearlyPrice, setTempYearlyPrice] = useState<string>('');
    const { setPrimaryAction } = useAction();

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
            setTempMonthlyPrice(plan.monthly_price?.toString() || '');
            setTempYearlyPrice(plan.yearly_price?.toString() || '');
            const monthlyTotal = (plan.monthly_price || 0) * 12;
            const currentDiscount = monthlyTotal > 0 ? Math.round((1 - (plan.yearly_price / monthlyTotal)) * 100) : 0;
            setDiscount(currentDiscount);
        } else {
            setTempMonthlyPrice('');
            setTempYearlyPrice('');
            setDiscount(20); // Default 20% discount for new plans
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
            monthly_price: tempMonthlyPrice,
            yearly_price: tempYearlyPrice,
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
                        <p className="text-sm text-gray-400 font-bold">قم بإعداد الأسعار الشهرية والسنوية لكل باقة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan: any) => {
                        const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || PLAN_ICONS.Default;
                        return (
                            <div key={plan.id} className="group relative bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                                    <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl transition-all duration-300">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                                            title="تعديل الخطة"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-0.5" />
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="p-2.5 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300"
                                            title="حذف الخطة"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6">
                                    <Icon className="w-8 h-8 text-primary" />
                                </div>

                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{plan.name}</h3>

                                <div className="space-y-4 mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-black uppercase tracking-widest">شهرياً</span>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">${Math.round(plan.monthly_price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
                                        <span className="text-xs text-gray-400 font-black uppercase tracking-widest">سنوياً</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-primary">${Math.round(plan.yearly_price)}</span>
                                            <p className="text-[10px] text-emerald-500 font-bold">توفير {Math.round((1 - (plan.yearly_price / (plan.monthly_price * 12))) * 100)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-white/5">
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">{feature}</span>
                                        </div>
                                    ))}
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
                                    <p className="text-[10px] font-bold text-gray-400 px-2">يظهر هذا الاسم للمشتركين في صفحة الأسعار.</p>
                                </div>

                                <div className="space-y-6 p-8 bg-gray-50/50 dark:bg-dark-800/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">توفير الدفع السنوي</label>
                                            <p className="text-[9px] font-bold text-gray-400">حفز العملاء على الاشتراك السنوي بخصم مغري</p>
                                        </div>
                                        <div className="px-4 py-2 bg-primary/10 rounded-2xl">
                                            <span className="text-xl font-black text-primary">{discount}%</span>
                                        </div>
                                    </div>
                                    <div className="relative pt-2 pb-6">
                                        <input
                                            type="range"
                                            min="0" max="50" step="5"
                                            value={discount}
                                            onChange={(e) => handleDiscountChange(parseInt(e.target.value))}
                                            className="w-full h-2.5 bg-gray-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="absolute top-7 left-0 right-0 flex justify-between px-1 text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                                            <span>بدون خصم</span>
                                            <span className="mr-4">توفير 25%</span>
                                            <span>نصف السعر تقريباً</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputField
                                            label="السعر الشهري ($)"
                                            name="monthly_price"
                                            type="number"
                                            step="0.01"
                                            value={tempMonthlyPrice}
                                            onChange={(e) => handleMonthlyChange(e.target.value)}
                                            required
                                            className="bg-white dark:bg-dark-900"
                                        />
                                        <p className="text-[9px] font-bold text-gray-400 px-2 italic text-center">التكلفة في الشهر الواحد</p>
                                    </div>
                                    <div className="space-y-2">
                                        <InputField
                                            label="السعر السنوي ($)"
                                            name="yearly_price"
                                            type="number"
                                            step="0.01"
                                            value={tempYearlyPrice}
                                            onChange={(e) => setTempYearlyPrice(e.target.value)}
                                            required
                                            className="bg-primary/5 border-primary/20 text-primary font-black"
                                        />
                                        <p className="text-[9px] font-bold text-primary/60 px-2 text-center">سعر الدفع لمرة واحدة سنوياً</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Features */}
                        <div className="space-y-8 flex flex-col h-full">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    <h5 className="text-lg font-black text-gray-900 dark:text-white">مميزات الباقة</h5>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">نقاط البيع</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col space-y-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <textarea
                                        name="features"
                                        rows={8}
                                        defaultValue={editingPlan?.features?.join('\n')}
                                        className="w-full h-full p-8 bg-gray-50/50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 rounded-[2rem] font-bold text-gray-700 dark:text-gray-200 outline-none transition-all resize-none shadow-inner relative z-10 custom-scrollbar leading-relaxed"
                                        placeholder="نقاط بيع غير محدودة&#10;إدارة المخزون والطلبات&#10;تقارير احترافية ومفصلة&#10;..."
                                    ></textarea>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl flex gap-3">
                                    <Star className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                                        نصيحة: ابدأ كل ميزة في سطر جديد. اجعل المميزات واضحة وجذابة لزيادة معدل التحويل.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Local footer removed - Actions are now in global toolbar */}
                </form>
            </Modal>
        </AdminLayout>
    );
}
