import React, { useState, useEffect } from 'react';
import { Search, User, DollarSign, Calendar, CheckCircle, ChevronLeft } from 'lucide-react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { useToast } from '@/shared/ui/notifications/feedback-context';

interface Tenant {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface PaymentsSidebarProps {
    tenants: Tenant[];
    selectedTenantId: string;
    onSelectTenant: (tenantId: string) => void;
    onSuccess: () => void;
}

export const PaymentsSidebar = ({ tenants, selectedTenantId, onSelectTenant, onSuccess }: PaymentsSidebarProps) => {
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        subscription_end_date: '',
        payment_method: 'cash',
        notes: ''
    });

    const selectedTenant = tenants.find(t => t.id === Number(selectedTenantId));

    useEffect(() => {
        if (selectedTenantId) {
            setShowForm(true);
        } else {
            setShowForm(false);
        }
    }, [selectedTenantId]);

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenantId) return;

        if (!formData.subscription_end_date) {
            return showToast('يرجى اختيار تاريخ انتهاء الاشتراك', 'error');
        }

        const payload = {
            tenant_id: selectedTenantId,
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
        } catch (err: any) {
            logger.error(err);
            showToast(err.response?.data?.message || 'فشل تسجيل الدفعة', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header / Context */}
            <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    إدارة العمليات
                </h3>
                <p className="text-xs text-gray-500 font-bold">اختر المشترك لتسجيل دفعة أو تصفية السجل</p>
            </div>

            {/* Selection Area */}
            {!showForm ? (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="relative">
                        <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث عن مشترك..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
                        <button
                            onClick={() => onSelectTenant('')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right font-bold text-xs ${!selectedTenantId
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                                }`}
                        >
                            <User className={`w-4 h-4 ${!selectedTenantId ? 'text-white' : 'text-primary'}`} />
                            <span>جميع المشتركين</span>
                        </button>

                        {filteredTenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => onSelectTenant(tenant.id.toString())}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right group ${selectedTenantId === tenant.id.toString()
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedTenantId === tenant.id.toString() ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {tenant.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-right overflow-hidden">
                                    <div className="text-[11px] font-black truncate">{tenant.name}</div>
                                    <div className={`text-[9px] truncate opacity-60 ${selectedTenantId === tenant.id.toString() ? 'text-white' : ''}`}>
                                        {tenant.email}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col space-y-5 animate-in slide-in-from-left duration-300">
                    {/* Selected Tenant Minimal Info */}
                    <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                                {selectedTenant?.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-black text-gray-900 dark:text-white">{selectedTenant?.name}</h4>
                                <p className="text-[10px] text-gray-500 font-bold">{selectedTenant?.email}</p>
                            </div>
                            <button
                                onClick={() => onSelectTenant('')}
                                className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Recording Form */}
                    <form onSubmit={handleRecordPayment} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">المبلغ (ILS)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-xs text-left"
                                    placeholder="0.00"
                                />
                                <DollarSign className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">انتهاء الاشتراك</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.subscription_end_date}
                                    onChange={e => setFormData({ ...formData, subscription_end_date: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-xs"
                                    required
                                />
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                            <select
                                value={formData.payment_method}
                                onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xs"
                            >
                                <option value="cash">نقد</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="check">شيك</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ملاحظات</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs h-20 resize-none"
                                placeholder="..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    حفظ البيانات
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
