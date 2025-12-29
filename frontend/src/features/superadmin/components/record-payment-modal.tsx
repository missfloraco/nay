import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

interface RecordPaymentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialTenantId?: string;
}

export const RecordPaymentModal = ({ onClose, onSuccess, initialTenantId }: RecordPaymentModalProps) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState<any[]>([]);

    // Toggle Mode: 'duration' (months) or 'date' (specific end date)
    const [mode, setMode] = useState<'duration' | 'date'>('duration');

    const [formData, setFormData] = useState({
        tenant_id: initialTenantId || '',
        amount: '',
        duration: '1',
        subscription_end_date: '',
        payment_method: 'cash',
        notes: ''
    });

    // Fetch tenants for dropdown
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res: any = await api.get('/admin/tenants');
                setTenants(res.data || []);
            } catch (e) { logger.error('Failed to load tenants', e); }
        };
        fetchTenants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenant_id) return showToast('يرجى اختيار المستأجر', 'error');

        // Prepare payload dynamically
        const payload: any = {
            tenant_id: formData.tenant_id,
            amount: formData.amount,
            payment_method: formData.payment_method,
            notes: formData.notes
        };

        if (mode === 'duration') {
            payload.duration = formData.duration;
        } else {
            if (!formData.subscription_end_date) return showToast('يرجى اختيار تاريخ الانتهاء', 'error');
            payload.subscription_end_date = formData.subscription_end_date;
        }

        setLoading(true);
        try {
            await api.post('/admin/payments', payload);
            showToast('تم تسجيل الدفعة وتمديد الاشتراك بنجاح', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'فشل تسجيل الدفعة', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">تسجيل دفعة يدوية</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tenant Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">المستأجر</label>
                        <div className="relative">
                            <select
                                value={formData.tenant_id}
                                onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                                disabled={!!initialTenantId}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-bold"
                            >
                                <option value="">اختر المستأجر...</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.domain})</option>
                                ))}
                            </select>
                            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">المبلغ (ILS)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold ltr text-right"
                                placeholder="0.00"
                                required
                            />
                            <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Extension Mode Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setMode('duration')}
                            className={`py-2 text-sm font-bold rounded-lg transition-all ${mode === 'duration' ? 'bg-white dark:bg-dark-800 shadow text-primary' : 'text-gray-500'}`}
                        >
                            مدة بالأشهر
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('date')}
                            className={`py-2 text-sm font-bold rounded-lg transition-all ${mode === 'date' ? 'bg-white dark:bg-dark-800 shadow text-primary' : 'text-gray-500'}`}
                        >
                            تاريخ انتهاء محدد
                        </button>
                    </div>

                    {/* Duration / Date Input */}
                    <div className="space-y-2">
                        {mode === 'duration' ? (
                            <>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">المدة (أشهر)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                        required
                                    />
                                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">تاريخ انتهاء الاشتراك الجديد</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.subscription_end_date}
                                        onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notes (Added to prevent 500 error if backend validation failed before) */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">ملاحظات (اختياري)</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-24 resize-none"
                            placeholder="أي تفاصيل إضافية..."
                        />
                    </div>

                    {/* Method */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['cash', 'bank_transfer', 'check'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: method })}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${formData.payment_method === method
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300'}`}
                                >
                                    {method === 'cash' && 'نقد'}
                                    {method === 'bank_transfer' && 'تحويل بنكي'}
                                    {method === 'check' && 'شيك'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'جاري التسجيل...' : 'تسجيل الدفعة وتمديد الاشتراك'}
                    </button>
                </form>
            </div>
        </div>
    );
};
