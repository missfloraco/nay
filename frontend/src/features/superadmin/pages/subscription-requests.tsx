import React, { useState } from 'react';
import { Check, X, User, Calendar, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Modal from '@/shared/ui/modals/modal';
import InputField from '@/shared/ui/forms/input-field';

export default function AdminSubscriptionRequestsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useFeedback();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const { data: requestsData, isLoading } = useQuery({
        queryKey: ['admin-subscription-requests'],
        queryFn: () => api.get('/admin/subscription-requests')
    });

    const requests = (requestsData as any)?.requests || [];

    const approveMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/subscription-requests/${selectedRequest.id}/approve`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscription-requests'] });
            showToast('تم الموافقة على الطلب بنجاح', 'success');
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/subscription-requests/${selectedRequest.id}/reject`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscription-requests'] });
            showToast('تم رفض الطلب', 'success');
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
        }
    });

    return (
        <AdminLayout title="طلبات الاشتراك" icon={AlertCircle}>
            <div className="p-8 space-y-8">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">طلبات الاشتراك المعلقة</h2>
                    <p className="text-sm text-gray-400 font-bold">إدارة طلبات ترقيه الحسابات وتفعيل الإشتراكات المدفوعة</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {requests.length === 0 && !isLoading && (
                        <div className="bg-white dark:bg-dark-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 text-center">
                            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">لا توجد طلبات معلقة</h3>
                            <p className="text-sm text-gray-400 font-bold">كل شيء تحت السيطرة!</p>
                        </div>
                    )}

                    {requests.map((request: any) => (
                        <div key={request.id} className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
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
                    ))}
                </div>
            </div>

            {/* Approval Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="الموافقة على طلب الاشتراك">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    approveMutation.mutate({
                        payment_reference: formData.get('payment_reference'),
                        admin_notes: formData.get('admin_notes')
                    });
                }} className="p-6 space-y-6">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20">
                        <p className="text-sm text-emerald-800 dark:text-emerald-500 font-bold">سيتم ترقية حساب المشترك إلى خطة <span className="text-emerald-900 dark:text-emerald-400 font-black">"{selectedRequest?.plan?.name}"</span> فور الموافقة.</p>
                    </div>
                    <InputField label="مرجع الدفع (اختياري)" name="payment_reference" placeholder="مثلا رقم التحويل أو إيصال السداد" />
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">ملاحظات الإدارة</label>
                        <textarea name="admin_notes" rows={3} className="w-full p-6 bg-gray-50 dark:bg-white/5 border-none rounded-[1.5rem] font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={approveMutation.isPending} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                        {approveMutation.isPending ? 'جاري التفعيل...' : 'تأكيد الموافقة والتفعيل'}
                    </button>
                </form>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="رفض طلب الاشتراك">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    rejectMutation.mutate({
                        admin_notes: formData.get('admin_notes')
                    });
                }} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">سبب الرفض</label>
                        <textarea name="admin_notes" rows={3} className="w-full p-6 bg-gray-50 dark:bg-white/5 border-none rounded-[1.5rem] font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={rejectMutation.isPending} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                        {rejectMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
                    </button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
