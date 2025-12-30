import { useState, useEffect, useMemo } from 'react';
import { Trash2, Plus, Filter, User, X, Wallet } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import Table from '@/shared/table';
import { formatDate } from '@/shared/utils/helpers';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import { useSearchParams } from 'react-router-dom';
import { IdentityCell, DateCell, CurrencyCell, ActionCell } from '@/shared/table-cells';
import { useAction } from '@/shared/contexts/action-context';
import { RecordPaymentModal } from '@/features/superadmin/components/record-payment-modal';

interface Payment {
    id: number;
    amount: string | null;
    currency: string;
    payment_method: string;
    paid_at: string;
    notes?: string;
    tenant?: {
        id: number;
        name: string;
        email: string;
    };
}

export default function PaymentsPage() {
    const { showSuccess, showError, showConfirm } = useFeedback();
    const { setPrimaryAction } = useAction();
    const [searchParams, setSearchParams] = useSearchParams();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Filtering State
    const [highlightedTenantId, setHighlightedTenantId] = useState<number | null>(null);
    const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get('tenant') || '');

    // Load tenants
    const loadTenants = async () => {
        try {
            const res = await api.get('/admin/tenants');
            const data = res.data || [];
            setTenants(data);
            return data;
        } catch (error) {
            logger.error(error);
            return [];
        }
    };

    // Load payments
    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/payments');
            setPayments(res.data || []);
        } catch (error) {
            logger.error(error);
            showError('فشل تحميل سجل الدفعات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await loadTenants();
            await loadPayments();

            const tenantId = searchParams.get('tenant');
            const shouldHighlight = searchParams.get('highlight');
            if (tenantId) {
                setSelectedTenantId(tenantId);
                if (shouldHighlight === 'true') {
                    setHighlightedTenantId(Number(tenantId));
                    setTimeout(() => setHighlightedTenantId(null), 3000);
                }
            }
        };
        init();
    }, []);

    // Register Footer Action
    useEffect(() => {
        setPrimaryAction({
            label: 'تسجيل دفعة يدوية',
            onClick: () => setShowModal(true),
            icon: Plus,
            variant: 'primary'
        });
        return () => setPrimaryAction(null);
    }, [setPrimaryAction]);

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title: 'حذف سجل الدفع',
            message: 'هل أنت متأكد من حذف هذه العملية؟',
            confirmLabel: 'حذف',
            isDestructive: true
        });

        if (!confirmed) return;

        try {
            await api.delete(`/admin/payments/${id}`);
            showSuccess('تم الحذف بنجاح');
            loadPayments();
        } catch (e) {
            showError('فشل الحذف');
        }
    };

    // Filter payments
    const filteredPayments = selectedTenantId
        ? payments.filter(p => p.tenant?.id === Number(selectedTenantId))
        : payments;

    const handleTenantSelect = (id: string) => {
        setSelectedTenantId(id);
        if (id) {
            setSearchParams({ tenant: id });
        } else {
            setSearchParams({});
        }
    };

    const columns = useMemo(() => [
        {
            header: 'المستأجر',
            accessor: (row: Payment) => (
                <IdentityCell
                    name={row.tenant?.name || '---'}
                    email={row.tenant?.email}
                    highlight={highlightedTenantId === row.tenant?.id}
                />
            ),
            exportValue: (row: Payment) => row.tenant?.name || '---',
            className: 'min-w-[200px]'
        },
        {
            header: 'المبلغ',
            accessor: (row: Payment) => (
                <CurrencyCell
                    amount={row.amount || 0}
                    currency={row.currency}
                />
            ),
            exportValue: (row: Payment) => `${row.amount || 0} ${row.currency}`,
            className: 'min-w-[120px]'
        },
        {
            header: 'التاريخ',
            accessor: (row: Payment) => (
                <DateCell date={row.paid_at} />
            ),
            exportValue: (row: Payment) => formatDate(row.paid_at),
            width: '15%'
        },
        {
            header: 'الطريقة',
            accessor: (row: Payment) => (
                <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-black text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/5">
                    {row.payment_method === 'cash' && 'نقد'}
                    {row.payment_method === 'bank_transfer' && 'تحويل بنكي'}
                    {row.payment_method === 'check' && 'شيك'}
                    {row.payment_method === 'other' && row.payment_method}
                </span>
            ),
            exportValue: (row: Payment) => {
                if (row.payment_method === 'cash') return 'نقد';
                if (row.payment_method === 'bank_transfer') return 'تحويل بنكي';
                if (row.payment_method === 'check') return 'شيك';
                return row.payment_method;
            },
            width: '15%'
        },
        {
            header: 'ملاحظات',
            accessor: (row: Payment) => (
                <span className="text-xs text-gray-400 font-medium truncate block max-w-[200px]" title={row.notes}>
                    {row.notes || '-'}
                </span>
            ),
            exportValue: (row: Payment) => row.notes || '-',
            width: '20%'
        },
        {
            header: '',
            accessor: (row: Payment) => (
                <ActionCell>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </ActionCell>
            ),
            width: '50px'
        }
    ], [highlightedTenantId, handleDelete]);

    return (
        <AdminLayout
            title="إدارة المدفوعات"
            icon={Wallet}
            hideLeftSidebar={true}
        >
            <div className="flex flex-col h-full bg-white dark:bg-dark-900">
                {/* Header Actions / Filter Toolbar */}
                <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Internal Header Removed */}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-[300px]">
                            <User className="absolute right-3 top-3 w-4 h-4 text-gray-400 z-10" />
                            <select
                                value={selectedTenantId}
                                onChange={(e) => handleTenantSelect(e.target.value)}
                                className="w-full h-10 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                            >
                                <option value="">جميع المشتركين</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                ))}
                            </select>
                            {/* Clear Filter Button */}
                            {selectedTenantId && (
                                <button
                                    onClick={() => handleTenantSelect('')}
                                    className="absolute left-2 top-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-6">
                    <Table<Payment>
                        columns={columns}
                        data={filteredPayments}
                        isLoading={loading}
                        emptyMessage={selectedTenantId ? "لا توجد دفعات لهذا المشترك" : "لا توجد عمليات دفع مسجلة"}
                        exportFileName="سجل_المدفوعات"
                    />
                </div>
            </div>

            {/* Record Payment Modal */}
            {showModal && (
                <RecordPaymentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        loadPayments();
                    }}
                />
            )}
        </AdminLayout>
    );
}
