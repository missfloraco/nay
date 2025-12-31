import React from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { Megaphone } from 'lucide-react';
import AdsTable from '@/features/superadmin/components/adstable';

export default function AdManagement() {
    return (
        <AdminLayout
            title="إدارة الإعلانات"
            icon={Megaphone}
            noPadding={true}
        >
            <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
                <AdsTable />
            </div>
        </AdminLayout>
    );
}
