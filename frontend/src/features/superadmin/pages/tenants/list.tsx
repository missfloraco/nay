import { resolveAssetUrl } from '@/shared/utils/helpers';
import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '@/shared/utils/helpers';
import { Users, User, Lock, Globe, Sparkles, Search, Filter, Plus, Mail, CheckCircle, XCircle, Trash2, Edit, ExternalLink, Shield, Loader2, MoreVertical, LayoutGrid, List as ListIcon, Calendar, Check, X, AlertTriangle, AlertCircle, Info, Database, HardDrive, Eye, Save, Clock } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import { useAction } from '@/shared/contexts/action-context';
import { UI_TEXT, TEXTS_ADMIN } from '@/shared/locales/texts';
import { ViewButton } from '@/shared/ui/buttons/btn-crud';
import Table from '@/shared/table';
import { TenantStatusBadge, STATUS_CONFIGS } from '@/features/superadmin/components/tenantstatusbadge';
import { TenantDetailsSidebar } from '@/features/superadmin/components/tenant-details-sidebar';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';
import InputField from '@/shared/ui/forms/input-field';

interface Tenant {
    id: number;
    uid: string;
    name: string;
    email: string;
    storage_used: string;
    status: 'pending' | 'trial' | 'active' | 'expired' | 'disabled';
    created_at: string;
    users_count?: number;
    subscription_ends_at?: string;
    trial_started_at?: string;
    trial_expires_at?: string;
    onboarding_completed?: boolean;
    avatar_url?: string;
    whatsapp?: string;
    country_code?: string;
    ads_enabled?: boolean;
}

export default function TenantsList() {
    const { showSuccess, showError } = useFeedback();
    const { registerAddAction, unregisterAddAction } = useAction();

    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [paginationMeta, setPaginationMeta] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ column: string; order: 'asc' | 'desc' }>({ column: 'created_at', order: 'desc' });

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Action Modal State
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        admin_email: '',
        admin_password: '',
        status: 'trial' as 'trial' | 'active',
        trial_expires_at: '',
        subscription_ends_at: '',
        ads_enabled: true
    });

    // Register FAB action for ADDING only
    useEffect(() => {
        const handleAdd = () => {
            setFormData({ name: '', admin_email: '', admin_password: '', status: 'trial', trial_expires_at: '', subscription_ends_at: '', ads_enabled: true });
            setIsCreateModalOpen(true);
        };

        registerAddAction(handleAdd, TEXTS_ADMIN.TENANTS.ADD_TENANT, Plus);

        return () => unregisterAddAction();
    }, [registerAddAction, unregisterAddAction]);

    // Load tenants with pagination, search, and sorting
    useEffect(() => {
        loadTenants();
    }, [currentPage, searchQuery, sortConfig]);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(currentPage),
                per_page: '15',
                ...(searchQuery && { search: searchQuery }),
                sort_by: sortConfig.column,
                sort_order: sortConfig.order
            });

            // API interceptor returns response.data directly, so the result IS the data object
            const result = await api.get(`/admin/tenants?${params.toString()}`) as any;
            setTenants(result.data || []);
            setPaginationMeta(result.meta || null);
        } catch (error) {
            logger.error('Error loading tenants:', error);
            showError(TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: any) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            await api.post('/admin/tenants', formData);
            showSuccess(TEXTS_ADMIN.MESSAGES.SUCCESS);
            setIsCreateModalOpen(false);
            loadTenants();
        } catch (error: any) {
            showError(error.response?.data?.message || TEXTS_ADMIN.MESSAGES.ERROR);
        } finally {
            setCreateLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSortChange = (column: string, order: 'asc' | 'desc') => {
        setSortConfig({ column, order });
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const getCountryName = (code?: string) => {
        if (!code) return '-';
        try {
            const name = new Intl.DisplayNames(['ar'], { type: 'region' }).of(code);
            return name ? name.split(' ')[0] : code;
        } catch (e) {
            return code;
        }
    };

    const getExpiryLabel = (tenant: Tenant) => {
        const isTrial = !tenant.subscription_ends_at && tenant.trial_expires_at;
        const date = tenant.subscription_ends_at || tenant.trial_expires_at;

        if (!date) return undefined;

        const expirationDate = new Date(date);
        const now = new Date();
        const diffTime = expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return isTrial ? 'تجربة منتهية' : 'اشتراك منتهٍ';

        const getDayLabel = (days: number) => {
            if (days === 0) return 'اليوم';
            if (days === 1) return 'ينتهي غداً';
            if (days === 2) return 'بقي يومان';
            if (days >= 3 && days <= 10) return `بقي ${days} أيام`;
            return `بقي ${days} يوماً`;
        };

        return isTrial ? `تجربة (${getDayLabel(diffDays)})` : `نشط (${getDayLabel(diffDays)})`;
    };

    const handleNavigateToPayments = (tenant: Tenant) => {
        // Navigate to payments page with tenant ID in URL
        window.location.href = `/admin/payments?tenant=${tenant.id}&highlight=true`;
    };

    const columns = useMemo(() => [
        {
            header: 'المستأجر',
            accessor: (tenant: Tenant) => (
                <IdentityCell
                    name={tenant.name}
                    avatar={tenant.avatar_url}
                />
            ),
            exportValue: (tenant: Tenant) => tenant.name,
            className: 'min-w-[200px]',
            sortable: true,
            sortKey: 'name'
        },
        {
            header: 'البريد الإلكتروني',
            accessor: (tenant: Tenant) => (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {tenant.email}
                </div>
            ),
            exportValue: (tenant: Tenant) => tenant.email,
            width: '15%',
            sortable: true,
            sortKey: 'email'
        },
        {
            header: 'البلد',
            accessor: (tenant: Tenant) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {getCountryName(tenant.country_code)}
                </span>
            ),
            exportValue: (tenant: Tenant) => getCountryName(tenant.country_code) || '',
            className: 'min-w-[100px]'
        },
        {
            header: 'رقم الهاتف / واتساب',
            accessor: (tenant: Tenant) => (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    {tenant.whatsapp || '-'}
                </div>
            ),
            exportValue: (tenant: Tenant) => tenant.whatsapp || '-',
            width: '15%'
        },
        {
            header: 'الحالة',
            accessor: (tenant: Tenant) => (
                <TenantStatusBadge status={tenant.status} trialExpiresAt={tenant.trial_expires_at} />
            ),
            exportValue: (tenant: Tenant) => STATUS_CONFIGS[tenant.status]?.label || tenant.status,
            className: 'min-w-[100px]'
        },

        {
            header: 'تاريخ الانضمام',
            accessor: (tenant: Tenant) => (
                <DateCell date={tenant.created_at} />
            ),
            exportValue: (tenant: Tenant) => formatDate(tenant.created_at),
            width: '15%',
            sortable: true,
            sortKey: 'created_at'
        },
        {
            header: 'تاريخ انتهاء الاشتراك',
            accessor: (tenant: Tenant) => (
                <DateCell
                    date={tenant.subscription_ends_at || tenant.trial_expires_at || ''}
                    label={getExpiryLabel(tenant)}
                    isUrgent={!tenant.subscription_ends_at || (tenant.subscription_ends_at && new Date(tenant.subscription_ends_at).getTime() < new Date().getTime() + (7 * 24 * 60 * 60 * 1000))}
                />
            ),
            exportValue: (tenant: Tenant) => formatDate(tenant.subscription_ends_at || tenant.trial_expires_at || ''),
            width: '15%'
        },
        {
            header: TEXTS_ADMIN.TENANTS.ACTIONS,
            accessor: (tenant: Tenant) => (
                <ActionCell>
                    <ViewButton
                        type="icon"
                        onClick={() => setSelectedTenant(tenant)}
                        icon={Eye}
                        label="إدارة"
                        variant="primary"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                    />
                </ActionCell>
            ),
            width: '10%',
            hideInExport: true
        }
    ], [getCountryName, setSelectedTenant]);

    return (
        <AdminLayout
            title={TEXTS_ADMIN.TITLES.TENANTS}
            leftSidebarContent={
                <TenantDetailsSidebar
                    tenant={selectedTenant}
                    tenants={tenants}
                    onSelect={setSelectedTenant}
                    onUpdate={loadTenants}
                    onNavigateToPayments={handleNavigateToPayments}
                />
            }
            leftSidebarNoPadding={true}
            leftSidebarNoBorder={false}
        >
            <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                    <Table<Tenant>
                        columns={columns}
                        data={tenants}
                        isLoading={loading}
                        exportFileName="قائمة_المشتركين"
                        paginationMeta={paginationMeta}
                        onPageChange={handlePageChange}
                        currentSort={sortConfig}
                        onSortChange={handleSortChange}
                    />
                </div>
            </div>

            {/* Create Tenant Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Plus className="w-6 h-6 text-primary" />
                                {TEXTS_ADMIN.TENANTS.ADD_TENANT}
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-8 space-y-8">
                                <form onSubmit={handleCreate} className="space-y-6">
                                    <InputField
                                        label={TEXTS_ADMIN.TENANTS.TENANT_NAME}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        icon={User}
                                        required
                                        placeholder="اسم المتجر أو المؤسسة"
                                    />

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                                            نوع الحساب والحالة
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: 'trial' })}
                                                className={`py-4 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-2 ${formData.status === 'trial' ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                            >
                                                <Clock className="w-5 h-5" />
                                                فترة تجريبية
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: 'active' })}
                                                className={`py-4 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-2 ${formData.status === 'active' ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                            >
                                                <Shield className="w-5 h-5" />
                                                اشتراك نشط
                                            </button>
                                        </div>

                                        <div className="pt-2">
                                            <InputField
                                                type="date"
                                                label={`تاريخ ${formData.status === 'trial' ? 'انتهاء التجربة' : 'انتهاء الاشتراك'}`}
                                                value={formData.status === 'trial' ? formData.trial_expires_at : formData.subscription_ends_at}
                                                onChange={(e) => {
                                                    if (formData.status === 'trial') setFormData({ ...formData, trial_expires_at: e.target.value });
                                                    else setFormData({ ...formData, subscription_ends_at: e.target.value });
                                                }}
                                                icon={Calendar}
                                                required
                                            />
                                            <div className="flex gap-2 mt-4">
                                                {[
                                                    { label: 'شهر', months: 1, color: 'blue' },
                                                    { label: 'سنة', months: 12, color: 'purple' },
                                                    { label: 'مداهمة', months: 1200, color: 'green', special: 'مدى الحياة' }
                                                ].map((btn) => (
                                                    <button
                                                        key={btn.label}
                                                        type="button"
                                                        onClick={() => {
                                                            const date = new Date();
                                                            date.setMonth(date.getMonth() + btn.months);
                                                            const dateStr = date.toISOString().split('T')[0];
                                                            if (formData.status === 'trial') setFormData({ ...formData, trial_expires_at: dateStr });
                                                            else setFormData({ ...formData, subscription_ends_at: dateStr });
                                                        }}
                                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl bg-${btn.color}-50 text-${btn.color}-600 dark:bg-${btn.color}-900/20 dark:text-${btn.color}-400 hover:scale-105 transition-all border border-${btn.color}-100 dark:border-${btn.color}-900/30`}
                                                    >
                                                        {btn.special || `+ ${btn.label}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-white/5 mt-6">
                                        <InputField
                                            label={TEXTS_ADMIN.TENANTS.ADMIN_EMAIL}
                                            type="email"
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            icon={Mail}
                                            required
                                            placeholder="email@example.com"
                                        />
                                        <InputField
                                            label={TEXTS_ADMIN.TENANTS.ADMIN_PASSWORD}
                                            type="password"
                                            value={formData.admin_password}
                                            onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                            icon={Lock}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-10">
                                        <button
                                            type="submit"
                                            disabled={createLoading}
                                            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] py-5 font-black hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl active:scale-95 group"
                                        >
                                            {createLoading ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                            )}
                                            {createLoading ? TEXTS_ADMIN.BUTTONS.SAVING : TEXTS_ADMIN.TENANTS.CREATE_TENANT}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-8 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl py-5 font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                        >
                                            {TEXTS_ADMIN.BUTTONS.CANCEL}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
