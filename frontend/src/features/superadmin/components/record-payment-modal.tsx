import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, DollarSign, Calendar, MessageSquare, CreditCard } from 'lucide-react';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import TextareaField from '@/shared/ui/forms/textarea-field';
import Modal from '@/shared/ui/modals/modal';

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
        <Modal
            isOpen={true}
            onClose={onClose}
            title="تسجيل دفعة يدوية"
            size="xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar p-1">

                    {/* Right Column: Payment Details */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            تفاصيل الدفع
                        </h4>

                        <div className="space-y-4">
                            <SelectField
                                label="المستأجر"
                                value={formData.tenant_id}
                                onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                                disabled={!!initialTenantId}
                                icon={UserIcon}
                                options={[
                                    { value: '', label: 'اختر المستأجر...' },
                                    ...tenants.map(t => ({ value: t.id, label: `${t.name} (${t.domain})` }))
                                ]}
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">المبلغ (ILS)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-lg ltr text-right"
                                        placeholder="0.00"
                                        required
                                    />
                                    <span className="absolute left-4 top-4.5 text-xs font-bold text-gray-400">ILS</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'cash', label: 'نقد' },
                                        { id: 'bank_transfer', label: 'تحويل' },
                                        { id: 'check', label: 'شيك' }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, payment_method: method.id })}
                                            className={`px-3 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${formData.payment_method === method.id
                                                ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
                                                : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Subscription & Notes */}
                    <div className="flex flex-col h-full">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2 mb-6">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            الاشتراك والملاحظات
                        </h4>

                        <div className="flex-1 flex flex-col space-y-6">
                            {/* Mode Toggle */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">طريقة التمديد</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setMode('duration')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'duration' ? 'bg-white dark:bg-dark-800 shadow-sm text-primary' : 'text-gray-500'}`}
                                    >
                                        مدة بالأشهر
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('date')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'date' ? 'bg-white dark:bg-dark-800 shadow-sm text-primary' : 'text-gray-500'}`}
                                    >
                                        تاريخ محدد
                                    </button>
                                </div>
                            </div>

                            {mode === 'duration' ? (
                                <InputField
                                    label="عدد الأشهر"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    icon={Calendar}
                                    required
                                />
                            ) : (
                                <InputField
                                    label="تاريخ انتهاء الاشتراك"
                                    type="date"
                                    value={formData.subscription_end_date}
                                    onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                                    icon={Calendar}
                                    required
                                />
                            )}

                            <div className="flex-1 flex flex-col pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">ملاحظات (اختياري)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="flex-1 w-full px-5 py-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none leading-relaxed min-h-[150px]"
                                    placeholder="أي تفاصيل إضافية عن الدفعة..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 flex gap-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <DollarSign className="w-6 h-6" />}
                        {loading ? 'جاري التسجيل...' : 'تسجيل الدفعة وتمديد الاشتراك'}
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
