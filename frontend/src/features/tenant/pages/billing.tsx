import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    LayoutDashboard,
    Sparkles
} from 'lucide-react';
import { useAction } from '@/shared/contexts/action-context';
import { formatDate } from '@/shared/utils/helpers';
import Table from '@/shared/table';
import { Toolbar } from '@/shared/components/toolbar';

export default function BillingPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { showSuccess } = useNotifications();
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'requests'>(() => {
        const tab = searchParams.get('tab');
        if (tab === 'payments' || tab === 'requests') return tab;
        return 'overview';
    });
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [notes, setNotes] = useState('');

    // Update URL when tab changes
    const handleTabChange = (tab: 'overview' | 'payments' | 'requests') => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });
    };

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
                onClick: () => requestMutation.mutate({
                    plan_id: selectedPlan.id,
                    billing_cycle: selectedPlan.billing_cycle,
                    notes
                }),
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
                    onChange={(val) => handleTabChange(val as any)}
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
                                    <div className="relative overflow-hidden group">
                                        {/* Background with Gradient and Blur */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 opacity-95 rounded-[2.5rem]" />

                                        {/* Animated Glow Effects */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] ease-in-out" />

                                        {/* Decorative Circles */}
                                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse" />
                                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-700" />

                                        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                            {/* Icon Section */}
                                            <div className="relative shrink-0">
                                                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 ring-8 ring-white/5">
                                                    <Sparkles className="w-12 h-12 text-white animate-pulse" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                                    <Clock className="w-4 h-4 text-amber-900" />
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 text-center md:text-right space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                                        <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-md">طلبك نشط وقيد المراجعة</h3>
                                                        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                                                    </div>
                                                    <p className="text-blue-100/80 font-bold text-lg md:text-xl">
                                                        أهلاً بك! لقد اخترت باقة <span className="text-white underline decoration-amber-400 decoration-2 underline-offset-4 font-black">"{pendingRequest.plan?.name}"</span>
                                                        <span className="mr-2 opacity-80 text-sm">
                                                            ({pendingRequest.billing_cycle === 'lifetime' ? 'مدى الحياة' :
                                                                pendingRequest.billing_cycle === 'fixed_term' ? `لمرة واحدة - ${pendingRequest.plan?.fixed_term_duration} ${pendingRequest.plan?.fixed_term_unit === 'years' ? 'سنة' : 'شهر'}` :
                                                                    pendingRequest.billing_cycle === 'monthly' ? 'باشتراك شهري' : 'باشتراك سنوي'})
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-inner mt-4">
                                                    <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
                                                        نحن نعمل حالياً على التحقق من تفاصيل طلبك. سيقوم فريق العمليات لدينا بإتمام التفعيل وتزويدك بكافة الصلاحيات المخصصة لهذه الباقة خلال وقت قصير جداً.
                                                    </p>
                                                </div>

                                                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-white text-xs font-black uppercase tracking-widest">الطلب مستلم</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                                        <span className="text-white text-xs font-black uppercase tracking-widest">جاري التحقق</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="shrink-0 w-full md:w-auto">
                                                <button
                                                    onClick={() => navigate('/app/support/messages')}
                                                    className="w-full md:w-auto px-8 h-14 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-black text-base shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                                >
                                                    <MessageSquare className="w-5 h-5" />
                                                    تواصل مع العمليات
                                                </button>
                                            </div>
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
                                        accessor: (r: any) => {
                                            const cycle = r.billing_cycle;
                                            const plan = r.plan;
                                            let displayPrice = 0;

                                            if (cycle === 'lifetime') displayPrice = plan?.lifetime_price;
                                            else if (cycle === 'fixed_term') displayPrice = plan?.fixed_term_price;
                                            else if (cycle === 'yearly') displayPrice = plan?.yearly_price;
                                            else displayPrice = plan?.monthly_price;

                                            return (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">باقة {plan?.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{displayPrice > 0 ? `$${Math.round(displayPrice)}` : 'مجانية'}</span>
                                                </div>
                                            );
                                        }
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
                                        header: 'نوع الاشتراك',
                                        accessor: (r: any) => {
                                            const cycle = r.billing_cycle;
                                            const plan = r.plan;
                                            if (cycle === 'lifetime') return 'مدى الحياة';
                                            if (cycle === 'fixed_term') return `مدة محددة (${plan?.fixed_term_duration} ${plan?.fixed_term_unit === 'years' ? 'سنة' : 'شهر'})`;
                                            if (cycle === 'monthly') return 'شهرياً';
                                            if (cycle === 'yearly') return 'سنوياً';
                                            return cycle;
                                        }
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
                                            <span className="text-sm font-bold text-gray-400">
                                                {selectedPlan?.billing_cycle === 'lifetime' ? '/ لمرة واحدة (مدى الحياة)' :
                                                    selectedPlan?.billing_cycle === 'fixed_term' ? `/ لمرة واحدة (${selectedPlan?.fixed_term_duration} ${selectedPlan?.fixed_term_unit === 'years' ? 'سنة' : 'شهر'})` :
                                                        selectedPlan?.billing_cycle === 'monthly' ? '/ شهرياً' : '/ سنوياً'}
                                            </span>
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
