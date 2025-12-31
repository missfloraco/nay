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
    const { showToast } = useFeedback();
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
            showToast('تم حفظ الخطة بنجاح', 'success');
            setIsModalOpen(false);
            setEditingPlan(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/plans/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            showToast('تم حذف الخطة', 'success');
        }
    });

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
        setPrimaryAction({
            label: 'إضافة خطة جديدة',
            icon: Plus,
            onClick: () => handleOpenModal(),
        });
        return () => setPrimaryAction(null);
    }, []);

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
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                    <button onClick={() => handleOpenModal(plan)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(plan.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? 'تعديل الخطة' : 'إضافة خطة جديدة'} size="xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <InputField label="اسم الخطة" name="name" defaultValue={editingPlan?.name} required placeholder="مثلاً: الباقة الاحترافية" />

                    <div className="space-y-6 p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between px-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">توفير سنوي (%)</label>
                            <span className="text-xl font-black text-primary">{discount}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="50" step="5"
                            value={discount}
                            onChange={(e) => handleDiscountChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between px-2 text-[10px] font-black text-gray-400 uppercase">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
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
                            />
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
                            />
                            <p className="text-[10px] text-gray-400 font-bold px-4 pt-1">يحتسب تلقائياً بناءً على الخصم</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">المميزات (سطر لكل ميزة)</label>
                        <textarea
                            name="features"
                            rows={6}
                            defaultValue={editingPlan?.features?.join('\n')}
                            className="w-full p-6 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 rounded-[2rem] font-bold text-gray-700 dark:text-gray-200 outline-none transition-all resize-none shadow-inner"
                            placeholder="نقاط بيع غير محدودة&#10;إدارة المخزون&#10;..."
                        ></textarea>
                    </div>

                    <button type="submit" disabled={saveMutation.isPending} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-lg">
                        {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ بيانات الخطة'}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
