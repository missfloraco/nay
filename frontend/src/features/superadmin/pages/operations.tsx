import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Wallet, Layers } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import TenantsTable from '@/features/superadmin/components/tenants-table';
import PaymentsTable from '@/features/superadmin/components/payments-table';
import { FooterFilters } from '@/shared/components/footer-filters';

export default function OperationsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tenants' | 'payments'>('tenants');

    useEffect(() => {
        if (location.pathname.includes('/payments')) {
            setActiveTab('payments');
        } else {
            setActiveTab('tenants');
        }
    }, [location.pathname]);

    const handleTabChange = (tab: 'tenants' | 'payments') => {
        setActiveTab(tab);
        navigate(`/admin/${tab}`);
    };

    return (
        <AdminLayout
            title={activeTab === 'tenants' ? 'إدارة المشتركين' : 'سجل المدفوعات'}
            icon={activeTab === 'tenants' ? Users : Wallet}
            noPadding={true}
        >
            <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto bg-white dark:bg-dark-950 shadow-sm border-x border-gray-100/50 dark:border-white/5">
                <FooterFilters
                    title="تصفية العمليات"
                    activeValue={activeTab}
                    onChange={(val) => handleTabChange(val as 'tenants' | 'payments')}
                    variant="pills"
                    options={[
                        { id: 'tenants', label: 'المشتركين', icon: Users },
                        { id: 'payments', label: 'سجل المدفوعات', icon: Wallet }
                    ]}
                />

                {/* Content Area - Full Height without top tabs */}

                {/* Content Area */}
                <div className="flex-1 bg-gray-50/50 dark:bg-dark-900/50">
                    {activeTab === 'tenants' ? <TenantsTable /> : <PaymentsTable />}
                </div>
            </div>
        </AdminLayout>
    );
}
