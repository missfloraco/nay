import React, { useState } from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                            تسجيل دفعة جديدة
                        </h2>
                        <p className="text-sm text-gray-500 font-bold mt-1">{tenantName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">المبلغ (ILS) - اختياري</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold ltr text-right"
                                placeholder="0.00 (اتركه فارغاً للتمديد المجاني)"
                            />
                            <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Subscription End Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">تاريخ انتهاء الاشتراك الجديد</label>
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

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                        <select
                            value={formData.payment_method}
                            onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                        >
                            <option value="cash">نقد</option>
                            <option value="bank_transfer">تحويل بنكي</option>
                            <option value="check">شيك</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">ملاحظات (اختياري)</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium h-24 resize-none"
                            placeholder="أي تفاصيل إضافية..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl text-base font-black transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <DollarSign className="w-5 h-5" />
                                حفظ الدفعة وتمديد الاشتراك
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
