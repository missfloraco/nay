import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Wallet, Layers, AlertCircle, User, X } from 'lucide-react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import TenantsTable from '@/features/superadmin/components/tenants-table';
import PaymentsTable from '@/features/superadmin/components/payments-table';
import SubscriptionRequestsTable from '@/features/superadmin/components/subscription-requests-table';
import { Toolbar } from '@/shared/components/toolbar';

export default function OperationsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tenants' | 'payments' | 'requests'>('tenants');
    const [searchParams, setSearchParams] = useSearchParams();

    // Payments Filter state
    const [tenantsList, setTenantsList] = useState<any[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get('tenant') || '');

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const res = await api.get('/admin/tenants');
                setTenantsList(res.data || []);
            } catch (error) {
                logger.error(error);
            }
        };
        loadTenants();
    }, []);

    useEffect(() => {
        if (location.pathname.includes('/payments')) {
            setActiveTab('payments');
        } else if (location.pathname.includes('/subscription-requests')) {
            setActiveTab('requests');
        } else {
            setActiveTab('tenants');
        }
    }, [location.pathname]);

    const handleTabChange = (tab: 'tenants' | 'payments' | 'requests') => {
        setActiveTab(tab);
        if (tab === 'requests') {
            navigate('/admin/subscription-requests');
        } else {
            // Preserve tenant filter if switching to payments
            const params = tab === 'payments' && selectedTenantId ? `?tenant=${selectedTenantId}` : '';
            navigate(`/admin/${tab}${params}`);
        }
    };

    const handleTenantChange = (id: string) => {
        setSelectedTenantId(id);
        if (id) {
            setSearchParams({ tenant: id });
        } else {
            setSearchParams({});
        }
    };

    return (
        <AdminLayout
            title={activeTab === 'tenants' ? 'إدارة المشتركين' : activeTab === 'payments' ? 'سجل المدفوعات' : 'طلبات الاشتراك'}
            icon={activeTab === 'tenants' ? Users : activeTab === 'payments' ? Wallet : AlertCircle}
            noPadding={true}
            toolbar={
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
                    <Toolbar
                        title="تصفية العمليات"
                        activeValue={activeTab}
                        onChange={(val) => handleTabChange(val as 'tenants' | 'payments' | 'requests')}
                        variant="pills"
                        options={[
                            { id: 'tenants', label: 'المشتركين', icon: Users },
                            { id: 'payments', label: 'سجل المدفوعات', icon: Wallet },
                            { id: 'requests', label: 'طلبات الاشتراك', icon: AlertCircle }
                        ]}
                    />

                    {/* Conditional select for payments tab */}
                    {activeTab === 'payments' && (
                        <div className="flex items-center gap-3 w-full lg:w-auto lg:min-w-[300px] animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="relative w-full">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                <select
                                    value={selectedTenantId}
                                    onChange={(e) => handleTenantChange(e.target.value)}
                                    className="w-full h-[46px] pr-12 pl-12 rounded-xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all shadow-sm"
                                >
                                    <option value="">جميع المشتركين</option>
                                    {tenantsList.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {selectedTenantId && (
                                    <button
                                        onClick={() => handleTenantChange('')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto bg-white dark:bg-dark-950 shadow-sm border-x border-gray-100/50 dark:border-white/5">
                {/* Content Area */}
                <div className="flex-1 bg-gray-50/50 dark:bg-dark-900/50">
                    {activeTab === 'tenants' ? (
                        <TenantsTable />
                    ) : activeTab === 'payments' ? (
                        <PaymentsTable
                            selectedTenantId={selectedTenantId}
                            onTenantChange={handleTenantChange}
                            tenants={tenantsList}
                        />
                    ) : (
                        <SubscriptionRequestsTable />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
