import React, { useState, useEffect, useRef } from 'react';
import { Check, X, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/shared/services/api';
import { useNotifications } from '@/shared/contexts/notification-context';
import Modal from '@/shared/ui/modals/modal';
import InputField from '@/shared/ui/forms/input-field';
import { useAction } from '@/shared/contexts/action-context';

export default function SubscriptionRequestsTable() {
    const queryClient = useQueryClient();
    const { showSuccess } = useNotifications();
    const [searchParams] = useSearchParams();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const highlightedId = searchParams.get('request_id');
    const highlightedRef = useRef<HTMLDivElement>(null);

    const { data: requestsData, isLoading } = useQuery({
        queryKey: ['admin-subscription-requests'],
        queryFn: () => api.get('/admin/subscription-requests')
    });

    const requests = (requestsData as any)?.requests || [];

    // Handle scroll to highlighted
    useEffect(() => {
        if (requests.length > 0 && highlightedId && highlightedRef.current) {
            const timer = setTimeout(() => {
                highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [requests.length, highlightedId]);

    const approveMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/subscription-requests/${selectedRequest.id}/approve`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscription-requests'] });
            showSuccess('تم الموافقة على الطلب بنجاح');
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/subscription-requests/${selectedRequest.id}/reject`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscription-requests'] });
            showSuccess('تم رفض الطلب');
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
        }
    });

    const { setPrimaryAction } = useAction();

    useEffect(() => {
        if (isApproveModalOpen) {
            setPrimaryAction({
                label: 'تأكيد الموافقة وتفعيل الحساب',
                icon: Check,
                type: 'submit',
                form: 'approve-form',
                loading: approveMutation.isPending,
                secondaryAction: {
                    label: 'إلغاء',
                    onClick: () => setIsApproveModalOpen(false)
                }
            });
        } else if (isRejectModalOpen) {
            setPrimaryAction({
                label: 'تأكيد الرفض النهائي',
                icon: X,
                variant: 'danger',
                type: 'submit',
                form: 'reject-form',
                loading: rejectMutation.isPending,
                secondaryAction: {
                    label: 'تراجع',
                    onClick: () => setIsRejectModalOpen(false)
                }
            });
        } else {
            setPrimaryAction(null);
        }
        return () => setPrimaryAction(null);
    }, [isApproveModalOpen, isRejectModalOpen, approveMutation.isPending, rejectMutation.isPending, setPrimaryAction]);

    if (isLoading) {
        return (
            <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">طلبات الاشتراك المعلقة</h2>
                <p className="text-sm text-gray-400 font-bold">إدارة طلبات ترقيه الحسابات وتفعيل الإشتراكات المدفوعة</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {requests.length === 0 && (
                    <div className="bg-white dark:bg-dark-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 text-center">
                        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">لا توجد طلبات معلقة</h3>
                        <p className="text-sm text-gray-400 font-bold">كل شيء تحت السيطرة!</p>
                    </div>
                )}

                {requests.map((request: any) => {
                    const isHighlighted = highlightedId === String(request.id);
                    return (
                        <div
                            key={request.id}
                            ref={isHighlighted ? highlightedRef : null}
                            className={`bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border ${isHighlighted ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.01]' : 'border-gray-100 dark:border-white/5 shadow-sm'} hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden`}
                        >
                            {isHighlighted && (
                                <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
                            )}
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                                    <User className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{request.tenant?.name}</h3>
                                    <p className="text-sm text-gray-400 font-bold">{request.tenant?.email}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${request.status === 'pending' ? 'bg-amber-100 text-amber-600' : request.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {request.status === 'pending' ? 'قيد المراجعة' : request.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                                        </span>
                                        <span className="text-xs text-primary font-black">يطلب: {request.plan?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 max-w-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <MessageSquare className="w-3 h-3" />
                                        <span>ملاحظات العميل</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-bold line-clamp-2">{request.notes || 'لا يوجد ملاحظات'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        <span>تاريخ الطلب</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">{new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => { setSelectedRequest(request); setIsApproveModalOpen(true); }}
                                            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            موافقة وتفعيل
                                        </button>
                                        <button
                                            onClick={() => { setSelectedRequest(request); setIsRejectModalOpen(true); }}
                                            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            رفض
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approval Modal */}
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="الموافقة على طلب الاشتراك والتفعيل"
                variant="content-fit"
            >
                <form
                    id="approve-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        approveMutation.mutate({
                            payment_reference: formData.get('payment_reference'),
                            admin_notes: formData.get('admin_notes')
                        });
                    }}
                    className="flex flex-col gap-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-900/20 space-y-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit">
                                    <Check className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-400">تأكيد التفعيل</h4>
                                    <p className="text-xs text-emerald-700/70 dark:text-emerald-500/60 font-bold leading-relaxed mt-2">
                                        سيتم تفعيل حساب المشترك فوراً. تذكر أن كافة مميزات النظام مفتوحة لجميع المشتركين، والفروقات تكمن فقط في مستوى الخدمة المختار (<span className="text-emerald-900 dark:text-white font-black">"{selectedRequest?.plan?.name}"</span>).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <InputField
                                    label="مرجع الدفع (اختياري)"
                                    name="payment_reference"
                                    placeholder="مثلا رقم التحويل أو إيصال السداد"
                                    className="bg-gray-50/50"
                                />
                                <p className="text-[10px] font-bold text-gray-400 px-2">يساعد في تتبع العملية المالية لاحقاً.</p>
                            </div>
                        </div>

                        <div className="space-y-2 group flex flex-col h-full">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">ملاحظات الإدارة للمشترك</label>
                            <textarea
                                name="admin_notes"
                                rows={6}
                                className="flex-1 w-full p-6 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:bg-white dark:focus:bg-dark-950 focus:border-emerald-500/20 rounded-[2rem] font-bold text-sm text-gray-700 dark:text-gray-200 outline-none transition-all resize-none shadow-inner custom-scrollbar"
                                placeholder="اكتب أي رسالة تود إرسالها للمشترك عند التفعيل..."
                            ></textarea>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="رفض طلب الاشتراك"
                variant="content-fit"
            >
                <form
                    id="reject-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        rejectMutation.mutate({
                            admin_notes: formData.get('admin_notes')
                        });
                    }}
                    className="flex flex-col gap-8"
                >
                    <div className="space-y-4">
                        <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20 flex items-center gap-6">
                            <div className="p-3 bg-red-500/10 rounded-2xl">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-red-900 dark:text-red-400">تحذير الرفض</h4>
                                <p className="text-xs text-red-700/70 dark:text-red-500/60 font-bold leading-relaxed mt-1">
                                    سيتم إخطار العميل برفض طلبه، ولن يتم إجراء أي تغيير على حسابه الحالي.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">سبب الرفض (يظهر للعميل)</label>
                            <textarea
                                name="admin_notes"
                                rows={4}
                                className="w-full p-8 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:bg-white dark:focus:bg-dark-950 focus:border-red-500/20 rounded-[2.5rem] font-bold text-sm text-gray-700 dark:text-gray-200 outline-none transition-all resize-none shadow-inner custom-scrollbar"
                                placeholder="يرجى كتابة سبب واضح لمساعدة العميل في تصحيح طلبه..."
                                required
                            ></textarea>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
