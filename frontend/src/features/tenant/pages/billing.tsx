import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useNotifications } from '@/shared/contexts/notification-context';
import Modal from '@/shared/ui/modals/modal';
import AppLayout from '@/features/tenant/pages/applayout';
import { PricingGrid } from '@/features/tenant/components/pricing-grid';
import {
    Zap,
    History,
    ArrowRight,
    MessageSquare,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    LayoutDashboard
} from 'lucide-react';
import { useAction } from '@/shared/contexts/action-context';
import { formatDate } from '@/shared/utils/helpers';
import Table from '@/shared/table';
import { Toolbar } from '@/shared/components/toolbar';

export default function BillingPage() {
    const queryClient = useQueryClient();
    const { showSuccess } = useNotifications();
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'requests'>('overview');
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [notes, setNotes] = useState('');

    const { data: currentSubData, isLoading: isSubLoading } = useQuery({
        queryKey: ['current-subscription'],
        queryFn: () => api.get('/app/subscription/current')
    });

    const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
        queryKey: ['billing-payments'],
        queryFn: () => api.get('/app/subscription/payments'),
        enabled: activeTab === 'payments'
    });

    const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
        queryKey: ['billing-requests'],
        queryFn: () => api.get('/app/subscription/requests'),
        enabled: activeTab === 'requests'
    });

    const currentSub = (currentSubData as any)?.subscription;
    const pendingRequest = (currentSubData as any)?.pending_request;
    const payments = (paymentsData as any)?.payments || [];
    const requests = (requestsData as any)?.requests || [];

    const requestMutation = useMutation({
        mutationFn: (data: any) => api.post('/app/subscription/request', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing-requests'] });
            showSuccess('تم إرسال طلب الاشتراك بنجاح');
            setSelectedPlan(null);
            setNotes('');
            setActiveTab('requests');
        }
    });

    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (selectedPlan && activeTab === 'overview') {
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
        } else {
            setPrimaryAction(null);
        }
        return () => setPrimaryAction(null);
    }, [selectedPlan, activeTab, requestMutation.isPending, requestMutation.mutate, notes, setPrimaryAction]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
            case 'active':
                return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
            case 'pending':
                return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
            case 'rejected':
            case 'failed':
            case 'canceled':
                return 'text-red-500 bg-red-50 dark:bg-red-500/10';
            default:
                return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'approved': return 'تمت الموافقة';
            case 'active': return 'نشط';
            case 'pending': return 'قيد المراجعة';
            case 'rejected': return 'مرفوض';
            case 'failed': return 'فشل';
            case 'canceled': return 'ملغي';
            default: return status;
        }
    };

    if (isSubLoading) {
        return (
            <AppLayout title="الفواتير والاشتراك" icon={DollarSign} noPadding={true}>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="الفواتير والاشتراك"
            icon={DollarSign}
            noPadding={true}
            toolbar={
                <Toolbar
                    activeValue={activeTab}
                    onChange={(val) => setActiveTab(val as any)}
                    variant="pills"
                    options={[
                        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
                        { id: 'payments', label: 'سجل المدفوعات', icon: History },
                        { id: 'requests', label: 'طلبات الترقية', icon: Clock }
                    ]}
                />
            }
        >
            <div className="flex flex-col h-full w-full bg-white dark:bg-dark-950 shadow-sm border-x border-gray-100/50 dark:border-white/5">
                <div className="flex-1 bg-gray-50/50 dark:bg-dark-900/50 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">

                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-12 pb-12">
                            {/* Current Plan Hero Card */}
                            <div className="relative group overflow-hidden bg-gradient-to-br from-primary to-primary-700 p-12 md:p-16 rounded-[var(--radius-card)] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 text-white">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700"></div>

                                <div className="relative space-y-4 max-w-2xl text-center md:text-right">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        <Zap className="w-4 h-4" />
                                        <span>نظام الاشتراك الذكي</span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                                        أنت مشترك في <br />
                                        <span className="text-emerald-300">{currentSub?.plan?.name || 'الباقة المجانية'}</span>
                                    </h2>
                                    <p className="text-xl md:text-2xl font-bold opacity-80 leading-relaxed">
                                        {currentSub
                                            ? `ينتهي اشتراكك في ${formatDate(currentSub.ends_at)}. نحن هنا لخدمتك دائماً.`
                                            : "استمتع بمميزات المنصة، وقم بالترقية للحصول على صلاحيات أكبر."}
                                    </p>
                                </div>

                                <div className="relative shrink-0 flex flex-col items-center gap-6">
                                    <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Sub Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-dark-900 p-8 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-xl space-y-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">موعد التجديد القادم</p>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {currentSub ? formatDate(currentSub.ends_at) : 'غير فعال'}
                                        </h4>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-dark-900 p-8 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-xl space-y-4">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">حسابك مفعل لمدة</p>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {currentSub ? 'سنة كاملة' : 'فترة تجريبية'}
                                        </h4>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-dark-900 p-8 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-xl space-y-4">
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">آخر دفعة مدفوعة</p>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {currentSub ? '$' + (currentSub.plan?.price || 0) : 'N/A'}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/5" />

                            {/* Plans Section */}
                            <div className="space-y-12">
                                <div className="text-center space-y-4 max-w-3xl mx-auto">
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                                        اختر الباقة <span className="text-primary">الأنسب لنمو أعمالك</span>
                                    </h1>
                                    <p className="text-lg text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                                        نقدم لك باقات مرنة صممت خصيصاً لتلبي احتياجات تجارة التجزئة، مع دعم فني متكامل ومميزات حصرية.
                                    </p>
                                </div>

                                <PricingGrid
                                    onSelectPlan={setSelectedPlan}
                                    currentSub={currentSub}
                                    pendingRequest={pendingRequest}
                                />

                                {pendingRequest && (
                                    <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-[var(--radius-card)] flex items-center gap-8 shadow-inner">
                                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center shrink-0">
                                            <span className="text-4xl animate-pulse">⏳</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-amber-900 dark:text-amber-500 mb-1">طلبك قيد المراجعة</h3>
                                            <p className="text-sm text-amber-700/70 dark:text-amber-500/60 font-medium">لقد طلبت الاشتراك في "{pendingRequest.plan?.name}". سيقوم فريقنا بالمراجعة والتواصل معك فوراً.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="h-full bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden p-6 lg:p-10">
                            <Table
                                columns={[
                                    { header: 'المعرف', accessor: (p: any) => <span className="text-xs font-black text-gray-400 uppercase tracking-tight">{p.transaction_id}</span> },
                                    {
                                        header: 'المبلغ',
                                        accessor: (p: any) => (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-gray-900 dark:text-white">${p.amount}</span>
                                                <span className="text-[10px] text-gray-400 font-black">{p.currency}</span>
                                            </div>
                                        )
                                    },
                                    { header: 'الوسيلة', accessor: (p: any) => <span className="text-sm font-bold text-gray-600">{p.payment_method === 'manual' ? 'تحويل بنكي' : p.payment_method}</span> },
                                    { header: 'التاريخ', accessor: (p: any) => formatDate(p.paid_at) },
                                    {
                                        header: 'الحالة',
                                        accessor: (p: any) => (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusColor(p.status)}`}>
                                                {getStatusText(p.status)}
                                            </span>
                                        )
                                    },
                                    {
                                        header: '',
                                        accessor: (p: any) => (
                                            <button className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )
                                    }
                                ]}
                                data={payments}
                                isLoading={isPaymentsLoading}
                                emptyMessage="لا يوجد سجل مدفوعات حالياً"
                            />
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="h-full bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden p-6 lg:p-10">
                            <Table
                                columns={[
                                    {
                                        header: 'الخطة المطلوبة',
                                        accessor: (r: any) => (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">باقة {r.plan?.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{r.plan?.price > 0 ? `$${r.plan.price}` : 'مجانية'}</span>
                                            </div>
                                        )
                                    },
                                    { header: 'تاريخ الطلب', accessor: (r: any) => formatDate(r.created_at) },
                                    {
                                        header: 'الحالة',
                                        accessor: (r: any) => (
                                            <div className="flex items-center gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusColor(r.status)}`}>
                                                    {getStatusText(r.status)}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'ملاحظات',
                                        accessor: (r: any) => (
                                            <span className="text-sm text-gray-500 font-medium truncate max-w-[200px]">
                                                {r.notes || '—'}
                                            </span>
                                        )
                                    },
                                ]}
                                data={requests}
                                isLoading={isRequestsLoading}
                                emptyMessage="لا يوجد طلبات اشتراك سابقة"
                            />
                        </div>
                    )}
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
                        <div className="space-y-6">
                            <div className="p-10 bg-primary/5 rounded-[var(--radius-card)] border-2 border-primary/10 space-y-8 relative overflow-hidden group">
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
                </div>
            </Modal>
        </AppLayout>
    );
}
