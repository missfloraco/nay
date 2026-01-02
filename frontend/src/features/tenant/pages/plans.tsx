import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Modal from '@/shared/ui/modals/modal';
import AppLayout from '@/features/tenant/pages/applayout';
import { PricingGrid } from '@/features/tenant/components/pricing-grid';
import { ArrowRight, MessageSquare, DollarSign, X } from 'lucide-react';
import { useAction } from '@/shared/contexts/action-context';

export default function TenantPlansPage() {
    const queryClient = useQueryClient();
    const { showSuccess } = useFeedback();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [notes, setNotes] = useState('');

    const { data: currentSubData } = useQuery({
        queryKey: ['current-subscription'],
        queryFn: () => api.get('/app/subscription/current')
    });

    const currentSub = (currentSubData as any)?.subscription;
    const pendingRequest = (currentSubData as any)?.pending_request;

    const requestMutation = useMutation({
        mutationFn: (data: any) => api.post('/app/subscription/request', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
            showSuccess('تم إرسال طلب الاشتراك بنجاح');
            setSelectedPlan(null);
            setNotes('');
        }
    });

    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (selectedPlan) {
            setPrimaryAction({
                label: requestMutation.isPending ? 'جاري الإرسال...' : 'إرسال طلب التفعيل والمتابعة',
                icon: ArrowRight,
                loading: requestMutation.isPending,
                onClick: () => requestMutation.mutate({ plan_id: selectedPlan.id, notes }),
                secondaryAction: {
                    label: 'إلغاء',
                    onClick: () => setSelectedPlan(null)
                }
            });
        }
        return () => setPrimaryAction(null);
    }, [selectedPlan, requestMutation.isPending, requestMutation.mutate, notes, setPrimaryAction]);

    return (
        <AppLayout title="خطط الاشتراك">
            <div className="w-full max-w-7xl mx-auto py-12 px-6 space-y-16">

                {/* Header Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                        ابدأ بـ 7 أيام تجريبية مجانية أو قم <span className="text-primary">بالترقية الآن</span>
                    </h1>

                    <PricingGrid
                        onSelectPlan={setSelectedPlan}
                        currentSub={currentSub}
                        pendingRequest={pendingRequest}
                    />
                </div>

                {pendingRequest && (
                    <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-[3rem] flex items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center shrink-0">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-amber-900 dark:text-amber-500 mb-1">طلب الاشتراك قيد المراجعة</h3>
                            <p className="text-sm text-amber-700/70 dark:text-amber-500/60 font-medium">لقد طلبت الاشتراك في "{pendingRequest.plan?.name}". سيقوم فريقنا بتفعيل حسابك فور التحقق من البيانات.</p>
                        </div>
                    </div>
                )}

                {/* Trial/Bonus Info Card */}
                <div className="bg-gradient-to-r from-primary to-primary-600 p-1 rounded-[3rem] shadow-2xl">
                    <div className="bg-white dark:bg-dark-900 p-10 md:p-16 rounded-[2.8rem] flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-right">
                        <div className="space-y-4 max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                                هل تريد الحصول على <span className="text-primary">7 أيام إضافية</span> مجاناً؟
                            </h2>
                            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                                قم بإكمال بيانات حسابك الآن واحصل على أسبوع إضافي مجاني فوراً! نحن ندعم نمو أعمالك بكل شغف.
                            </p>
                        </div>
                        <button
                            className="shrink-0 px-12 py-6 bg-primary text-white rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-4"
                            onClick={() => window.location.href = '/app/settings'}
                        >
                            <span>إكمال البيانات الآن</span>
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                title={`تأكيد طلب التفعيل - باقة ${selectedPlan?.name}`}
                variant="content-fit"
            >
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Financial Summary */}
                        <div className="space-y-6">
                            <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <DollarSign className="w-32 h-32 text-primary" />
                                </div>

                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                            <DollarSign className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest">التكلفة الإجمالية</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black text-gray-900 dark:text-white">${Math.round(selectedPlan?.price)}</span>
                                            <span className="text-sm font-bold text-gray-400">/{selectedPlan?.billing_cycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                                        </div>
                                        <p className="text-xs text-primary font-black uppercase tracking-widest">باقة {selectedPlan?.name}</p>
                                    </div>

                                    <div className="pt-6 border-t border-primary/10 group-hover:border-primary/20 transition-colors">
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed italic">
                                            بمجرد إرسال الطلب، سيقوم فريق المبيعات بالتواصل معك خلال ساعة عمل واحدة لتنسيق عملية التحويل وتفعيل الحساب.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="space-y-6 flex flex-col h-full">
                            <div className="space-y-2 group flex-1 flex flex-col">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    <span>ملاحظات إضافية حول طلبك</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="flex-1 w-full p-8 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:bg-white dark:focus:bg-dark-950 focus:border-primary/20 rounded-[2.5rem] font-bold text-sm text-gray-800 dark:text-gray-100 outline-none transition-all resize-none shadow-inner custom-scrollbar"
                                    placeholder="هل لديك أي استفسار أو طلب خاص قبل التفعيل؟ (اختياري)..."
                                ></textarea>
                            </div>
                            <p className="text-[9px] text-gray-400 font-bold px-4 leading-relaxed">بإرسالك الطلب، أنت توافق على شروط الخدمة وسياسية الخصوصية الخاصة بنا.</p>
                        </div>
                    </div>

                    {/* Local footer removed - Actions are now in global toolbar */}
                </div>
            </Modal>
        </AppLayout>
    );
}
