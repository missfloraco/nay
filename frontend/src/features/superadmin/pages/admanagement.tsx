import React from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AdsTable from '@/features/superadmin/components/adstable';

export default function AdManagement() {
    return (
        <AdminLayout title="إدارة الإعلانات" noPadding={true} hideLeftSidebar={true}>
            <div className="h-full flex flex-col animate-in fade-in duration-700">
                <div className="flex-1 flex flex-col">
                    <AdsTable />
                </div>
            </div>
        </AdminLayout>
    );
}
