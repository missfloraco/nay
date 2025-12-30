import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import Modal from '@/shared/ui/modals/modal';

interface ManagePaymentsModalProps {
    tenantId: string | number;
    tenantName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const ManagePaymentsModal = ({ tenantId, tenantName, onClose, onSuccess }: ManagePaymentsModalProps) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        subscription_end_date: '',
        payment_method: 'cash',
        notes: ''
    });

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subscription_end_date) {
            return showToast('يرجى اختيار تاريخ انتهاء الاشتراك', 'error');
        }

        const payload: any = {
            tenant_id: tenantId,
            amount: formData.amount || null,
            subscription_end_date: formData.subscription_end_date,
            payment_method: formData.payment_method,
            notes: formData.notes
        };

        setLoading(true);
        try {
            await api.post('/admin/payments', payload);
            showToast('تم تسجيل الدفعة بنجاح', 'success');
            onSuccess();
            setFormData({
                amount: '',
                subscription_end_date: '',
                payment_method: 'cash',
                notes: ''
            });
            onClose();
        } catch (e: any) {
            logger.error(e);
            showToast(e.response?.data?.message || 'فشل تسجيل الدفعة', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="تسجيل دفعة جديدة"
            size="xl"
            description={tenantName}
        >
            <form onSubmit={handleRecordPayment} className="flex flex-col h-full">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar p-1">

                    {/* Right Column: Payment Details */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            تفاصيل الدفع
                        </h4>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">المبلغ المدفوع (ILS)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-lg ltr text-right"
                                    placeholder="0.00"
                                />
                                <span className="absolute left-4 top-4.5 text-xs font-bold text-gray-400">ILS</span>
                            </div>
                            <p className="text-[10px] text-gray-400 px-1 font-bold">* اتركه فارغاً لتمديد الاشتراك مجاناً (عرض/منحة)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['cash', 'bank_transfer', 'check', 'other'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_method: method })}
                                        className={`py-3 rounded-xl border-2 transition-all font-bold text-xs flex items-center justify-center gap-2 ${formData.payment_method === method ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                    >
                                        {method === 'cash' ? '💵 نقد' : method === 'bank_transfer' ? '🏦 تحويل' : method === 'check' ? '🎫 شيك' : '🔖 أخرى'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تاريخ انتهاء الاشتراك الجديد</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.subscription_end_date}
                                    onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                                    required
                                />
                                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Notes */}
                    <div className="flex flex-col h-full">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2 mb-6">
                            <FileText className="w-5 h-5 text-blue-500" />
                            ملاحظات إضافية
                        </h4>

                        <div className="flex-1 flex flex-col">
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="flex-1 w-full px-5 py-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none leading-relaxed"
                                placeholder="سجل أي ملاحظات مهمة بخصوص هذه الدفعة..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 flex gap-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all text-base flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <DollarSign className="w-5 h-5" />
                        )}
                        <span>حفظ الدفعة وتمديد الاشتراك</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl py-4 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </Modal>
    );
};
