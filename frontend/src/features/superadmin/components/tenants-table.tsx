import { resolveAssetUrl } from '@/shared/utils/helpers';
import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '@/shared/utils/helpers';
import { Users, User, Lock, Globe, Sparkles, Search, Filter, Plus, Mail, CheckCircle, XCircle, Trash2, Edit, ExternalLink, Shield, Loader2, MoreVertical, LayoutGrid, List as ListIcon, Calendar, Check, X, AlertTriangle, AlertCircle, Info, Database, HardDrive, Eye, Save, Clock } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/notification-context';
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
import Modal from '@/shared/ui/modals/modal';
import Button from '@/shared/ui/buttons/btn-base';

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
    email_verified_at?: string;
}

export default function TenantsTable() {
    const { showSuccess, showError } = useNotifications();
    const { setPrimaryAction } = useAction();

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
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        admin_email: '',
        admin_password: '',
        status: 'trial' as 'trial' | 'active',
        trial_expires_at: '',
        subscription_ends_at: '',
        ads_enabled: true
    });

    const handleSelectTenant = (tenant: Tenant | null) => {
        setSelectedTenant(tenant);
        setIsDetailsModalOpen(!!tenant);
    };

    // Load tenants with pagination, search, and sorting
    useEffect(() => {
        loadTenants();
    }, [currentPage, searchQuery, sortConfig]);

    // Register Footer Toolbar Actions
    useEffect(() => {
        if (isCreateModalOpen) {
            setPrimaryAction({
                label: 'إنشاء حساب المستأجر الآن',
                icon: Sparkles,
                type: 'submit',
                form: 'create-tenant-form',
                loading: createLoading,
                secondaryAction: {
                    label: 'إلغاء',
                    onClick: () => setIsCreateModalOpen(false)
                }
            });
        } else if (isDetailsModalOpen) {
            // Let the TenantDetailsSidebar handle the primary action
            return;
        } else {
            setPrimaryAction({
                label: TEXTS_ADMIN.TENANTS.ADD_TENANT,
                icon: Plus,
                onClick: () => {
                    setFormData({ name: '', admin_email: '', admin_password: '', status: 'trial', trial_expires_at: '', subscription_ends_at: '', ads_enabled: true });
                    setIsCreateModalOpen(true);
                }
            });
        }
        return () => setPrimaryAction(null);
    }, [isCreateModalOpen, isDetailsModalOpen, createLoading, setPrimaryAction]);

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
                    uid={tenant.uid}
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
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {tenant.email}
                    </div>
                    {tenant.email_verified_at ? (
                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>مؤكد</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>غير مؤكد</span>
                        </div>
                    )}
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
                        onClick={() => handleSelectTenant(tenant)}
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
    ], [getCountryName, handleSelectTenant]);

    return (
        <>
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
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={TEXTS_ADMIN.TENANTS.ADD_TENANT}
                variant="content-fit"
            >
                <form
                    id="create-tenant-form"
                    onSubmit={handleCreate}
                    className="flex flex-col gap-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Right Column: Account Details */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 bg-primary/10 rounded-2xl">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <h5 className="text-lg font-black text-gray-900 dark:text-white">بيانات المسؤول</h5>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <InputField
                                        label={TEXTS_ADMIN.TENANTS.TENANT_NAME}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        icon={LayoutGrid}
                                        required
                                        placeholder="اسم المتجر أو المؤسسة"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                        هذا الاسم سيظهر في واجهة المتجر ورسائل البريد الإلكتروني.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <InputField
                                        label={TEXTS_ADMIN.TENANTS.ADMIN_EMAIL}
                                        type="email"
                                        value={formData.admin_email}
                                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                        icon={Mail}
                                        required
                                        placeholder="email@example.com"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                        البريد الأساسي للدخول إلى لوحة تحكم المستأجر.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <InputField
                                        label={TEXTS_ADMIN.TENANTS.ADMIN_PASSWORD}
                                        type="password"
                                        value={formData.admin_password}
                                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                        icon={Lock}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                        تأكد من اختيار كلمة مرور قوية لحماية الحساب.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Subscription Details */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 bg-emerald-500/10 rounded-2xl">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h5 className="text-lg font-black text-gray-900 dark:text-white">إعدادات الاشتراك</h5>
                                <span className="mr-auto px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 border border-emerald-500/20 uppercase tracking-widest">الصلاحية</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">نوع الحساب ووضعية التشغيل</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'trial' })}
                                            className={`p-5 rounded-[var(--radius-inner)] border-2 transition-all flex flex-col gap-2 items-start text-right group ${formData.status === 'trial' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 hover:border-primary/30'}`}
                                        >
                                            <div className={`p-2 rounded-2xl transition-colors ${formData.status === 'trial' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-800 text-gray-500 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black ${formData.status === 'trial' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>فترة تجريبية</p>
                                                <p className="text-[10px] font-bold text-gray-400">وصول محدود زمنياً للمعاينة</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'active' })}
                                            className={`p-5 rounded-[var(--radius-inner)] border-2 transition-all flex flex-col gap-2 items-start text-right group ${formData.status === 'active' ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 hover:border-emerald-500/30'}`}
                                        >
                                            <div className={`p-2 rounded-xl transition-colors ${formData.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-dark-800 text-gray-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'}`}>
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black ${formData.status === 'active' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>اشتراك مدفوع</p>
                                                <p className="text-[10px] font-bold text-gray-400">تفعيل كامل لكافة المميزات</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 p-8 bg-gray-50/50 dark:bg-dark-800/40 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5">
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
                                        className="bg-white dark:bg-dark-900"
                                    />

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'شهر', months: 1, color: 'blue' },
                                            { label: 'سنة', months: 12, color: 'purple' },
                                            { label: 'مدى الحياة', months: 1200, color: 'emerald', special: true }
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
                                                className={`py-3 text-[10px] font-black uppercase tracking-tighter rounded-2xl transition-all border ${btn.color === 'blue'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
                                                    : btn.color === 'purple'
                                                        ? 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-600 hover:text-white'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                    }`}
                                            >
                                                {btn.special ? btn.label : `+ ${btn.label}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Local footer removed - Actions are now in global toolbar */}
                </form>
            </Modal>

            {/* Edit Tenant Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="تفاصيل المشترك"
                variant="content-fit"
            >
                <TenantDetailsSidebar
                    tenant={selectedTenant}
                    tenants={tenants}
                    onSelect={handleSelectTenant}
                    onUpdate={loadTenants}
                    onNavigateToPayments={handleNavigateToPayments}
                />
            </Modal>

        </>
    );
}
