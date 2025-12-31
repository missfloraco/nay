import React, { useState } from 'react';
import { MessageSquare, DollarSign } from 'lucide-react';
import AppLayout from '@/features/tenant/pages/applayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Modal from '@/shared/ui/modals/modal';
import { PricingGrid } from '@/features/tenant/components/pricing-grid';
import { ArrowRight } from 'lucide-react';

export default function TenantPlansPage() {
    const queryClient = useQueryClient();
    const { showToast } = useFeedback();
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
            showToast('تم إرسال طلب الاشتراك بنجاح', 'success');
            setSelectedPlan(null);
            setNotes('');
        }
    });

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

            <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={`تأكيد الاشتراك - ${selectedPlan?.name}`}>
                <div className="p-8 space-y-8">
                    <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">إجمالي المبلغ المطلوب</p>
                                <p className="text-4xl font-black text-gray-900 dark:text-white">${Math.round(selectedPlan?.price)} <span className="text-sm text-gray-400">/{selectedPlan?.billing_cycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span></p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-primary/10">
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed">بمجرد الضغط على إرسال، سيقوم أحد مندوبي المبيعات لدينا بالتواصل معك خلال ساعة عمل واحدة لتنسيق عملية التحويل وتفعيل الحساب بشكل دائم.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-4">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span>ملاحظات إضافية</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="اكتب أي ملاحظة تود تزويدنا بها (اختياري)..."
                            className="w-full p-8 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 rounded-[2.5rem] font-bold text-gray-800 dark:text-gray-100 outline-none transition-all resize-none shadow-inner"
                        ></textarea>
                    </div>

                    <button
                        onClick={() => requestMutation.mutate({ plan_id: selectedPlan.id, notes })}
                        disabled={requestMutation.isPending}
                        className="w-full py-6 bg-primary text-white rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {requestMutation.isPending ? 'جاري الإرسال...' : 'إرسال طلب التفعيل الآن'}
                    </button>

                    <p className="text-center text-xs text-gray-400 font-bold">بإرسالك الطلب، أنت توافق على شروط الخدمة وسياسية الخصوصية الخاصة بنا.</p>
                </div>
            </Modal>
        </AppLayout>
    );
}
