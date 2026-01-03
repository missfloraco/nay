import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, DollarSign, Calendar, MessageSquare, CreditCard, Clock } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/notification-context';
import { useAction } from '@/shared/contexts/action-context';
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
    const { showSuccess, showError } = useNotifications();
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
        if (e) e.preventDefault();
        if (!formData.tenant_id) return showError('يرجى اختيار المستأجر');

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
            if (!formData.subscription_end_date) return showError('يرجى اختيار تاريخ الانتهاء');
            payload.subscription_end_date = formData.subscription_end_date;
        }

        setLoading(true);
        try {
            await api.post('/admin/payments', payload);
            showSuccess('تم تسجيل الدفعة وتمديد الاشتراك بنجاح');
            onSuccess();
            onClose();
        } catch (error: any) {
            showError(error.response?.data?.message || 'فشل تسجيل الدفعة');
        } finally {
            setLoading(false);
        }
    };

    const { setPrimaryAction } = useAction();

    useEffect(() => {
        setPrimaryAction({
            label: 'تثبيت الدفعة وتمديد الحساب',
            icon: DollarSign,
            type: 'submit',
            form: 'record-payment-form',
            loading: loading,
            secondaryAction: {
                label: 'تجاهل',
                onClick: onClose
            }
        });
        return () => setPrimaryAction(null);
    }, [loading, setPrimaryAction, onClose]);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="تسجيل دفعة يدوية وتمديد الاشتراك"
            variant="content-fit"
        >
            <form
                id="record-payment-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Right Column: Payment Details */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h5 className="text-lg font-black text-gray-900 dark:text-white">تفاصيل الدفعة المالية</h5>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <SelectField
                                    label="المستأجر المستهدف"
                                    value={formData.tenant_id}
                                    onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                                    disabled={!!initialTenantId}
                                    icon={UserIcon}
                                    className="bg-gray-50/50"
                                    options={[
                                        { value: '', label: 'اختر المستأجر مـن القائمة...' },
                                        ...tenants.map(t => ({ value: t.id, label: `${t.name} (${t.domain})` }))
                                    ]}
                                />
                                <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                    سيتم تسجيل الدفعة وتمديد اشتراك الحساب المختار فور الحفظ.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">القيمة وطريقة التحصيل</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full px-5 py-5 rounded-[1.5rem] border-2 border-transparent bg-gray-50 dark:bg-white/5 focus:bg-white dark:focus:bg-dark-900 focus:border-emerald-500/20 transition-all font-black text-2xl ltr text-right outline-none shadow-inner"
                                                placeholder="0.00"
                                                required
                                            />
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 group-focus-within:text-emerald-500">ILS</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400 px-2 italic text-center">المبلغ المستلم فعلياً</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'cash', label: 'نقد / كاش', icon: DollarSign, color: 'emerald' },
                                            { id: 'bank_transfer', label: 'تحويل بنكي', icon: CreditCard, color: 'blue' },
                                            { id: 'check', label: 'شيك مصرفي', icon: MessageSquare, color: 'amber' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, payment_method: method.id })}
                                                className={`px-4 py-3 rounded-2xl text-[11px] font-black border-2 transition-all flex items-center gap-3 ${formData.payment_method === method.id
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
                                                    : 'bg-transparent border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-200'}`}
                                            >
                                                <method.icon className={`w-4 h-4 ${formData.payment_method === method.id ? 'text-primary' : 'text-gray-400'}`} />
                                                {method.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Subscription & Notes */}
                    <div className="space-y-8 flex flex-col h-full">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <h5 className="text-lg font-black text-gray-900 dark:text-white">التمديد والملاحظات</h5>
                        </div>

                        <div className="flex-1 flex flex-col space-y-6">
                            {/* Mode Toggle */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">آلية تمديد الصلاحية</label>
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setMode('duration')}
                                        className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'duration' ? 'bg-white dark:bg-dark-800 shadow-xl text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        مدة محددة (أشهر)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('date')}
                                        className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'date' ? 'bg-white dark:bg-dark-800 shadow-xl text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        تاريخ انتهاء ثابت
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {mode === 'duration' ? (
                                    <div className="space-y-1.5">
                                        <InputField
                                            label="عدد الأشهر المضافة"
                                            type="number"
                                            min="1"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            icon={Clock}
                                            required
                                            className="bg-gray-50/50"
                                        />
                                        <p className="text-[9px] font-bold text-gray-400 px-2 leading-relaxed">
                                            سيتم إضافة {formData.duration} أشهر إلى تاريخ الانتهاء الحالي للمستأجر.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <InputField
                                            label="تاريخ الانتهاء الجديد"
                                            type="date"
                                            value={formData.subscription_end_date}
                                            onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                                            icon={Calendar}
                                            required
                                            className="bg-gray-50/50"
                                        />
                                        <p className="text-[9px] font-bold text-gray-400 px-2 leading-relaxed">
                                            بغض النظر عن الرصيد السابق، سيصبح هذا التاريخ هو موعد انتهاء الاشتراك.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">بيانات إضافية أو مرجعية</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="flex-1 w-full p-6 rounded-[2rem] border-2 border-transparent bg-gray-50 dark:bg-black/20 focus:bg-white dark:focus:bg-dark-950 focus:border-primary/20 transition-all font-bold text-sm resize-none leading-relaxed min-h-[140px] outline-none shadow-inner custom-scrollbar"
                                    placeholder="أدخل أي تفاصيل مثل رقم الحوالة أو اسم الشخص المستلم..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local footer removed - Actions are now in global toolbar */}
            </form>
        </Modal>
    );
};
