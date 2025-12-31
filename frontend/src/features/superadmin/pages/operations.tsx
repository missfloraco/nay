import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Wallet, Layers } from 'lucide-react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import TenantsTable from '@/features/superadmin/components/tenants-table';
import PaymentsTable from '@/features/superadmin/components/payments-table';

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
            <div className="flex flex-col h-full">
                {/* Tab Switcher */}
                <div className="bg-white dark:bg-dark-950 border-b border-gray-200 dark:border-dark-800 px-6 pt-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleTabChange('tenants')}
                            className={`pb-4 px-2 text-sm font-black relative transition-all ${activeTab === 'tenants'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>المشتركين</span>
                            </div>
                            {activeTab === 'tenants' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                            )}
                        </button>

                        <button
                            onClick={() => handleTabChange('payments')}
                            className={`pb-4 px-2 text-sm font-black relative transition-all ${activeTab === 'payments'
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5" />
                                <span>المدفوعات</span>
                            </div>
                            {activeTab === 'payments' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50/50 dark:bg-dark-900/50">
                    {activeTab === 'tenants' ? <TenantsTable /> : <PaymentsTable />}
                </div>
            </div>
        </AdminLayout>
    );
}
