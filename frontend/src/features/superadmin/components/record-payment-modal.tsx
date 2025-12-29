import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, DollarSign, Calendar, MessageSquare, CreditCard } from 'lucide-react';
import { useToast } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import InputField from '@/shared/ui/forms/input-field';
import SelectField from '@/shared/ui/forms/select-field';
import TextareaField from '@/shared/ui/forms/textarea-field';

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

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[85vh] overflow-y-auto no-scrollbar">
                    {/* Tenant Selection */}
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

                    {/* Amount */}
                    <InputField
                        label="المبلغ (ILS)"
                        type="number"
                        min="0"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        icon={DollarSign}
                        className="ltr"
                        required
                    />

                    {/* Extension Mode Toggle */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">طريقة احتساب الاشتراك</label>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setMode('duration')}
                                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === 'duration' ? 'bg-white dark:bg-dark-800 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                مدة بالأشهر
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('date')}
                                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === 'date' ? 'bg-white dark:bg-dark-800 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                تاريخ انتهاء محدد
                            </button>
                        </div>
                    </div>

                    {/* Duration / Date Input */}
                    {mode === 'duration' ? (
                        <InputField
                            label="المدة (أشهر)"
                            type="number"
                            min="1"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            icon={Calendar}
                            required
                        />
                    ) : (
                        <InputField
                            label="تاريخ انتهاء الاشتراك الجديد"
                            type="date"
                            value={formData.subscription_end_date}
                            onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                            icon={Calendar}
                            required
                        />
                    )}

                    {/* Notes */}
                    <TextareaField
                        label="ملاحظات (اختياري)"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="أي تفاصيل إضافية عن الدفعة..."
                        icon={MessageSquare}
                        className="min-h-[100px]"
                    />

                    {/* Method */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                        {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <DollarSign className="w-6 h-6" />}
                        {loading ? 'جاري التسجيل...' : 'تسجيل الدفعة وتمديد الاشتراك'}
                    </button>
                </form>
            </div>
        </div>
    );
};
