import React, { useMemo } from 'react';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import Table from '@/shared/table';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';

const recentTenants = [
    { id: 1, name: 'مطعم السعادة', email: 'contact@happiness.com', status: 'نشط', date: '2024-03-15' },
    { id: 2, name: 'سوبر ماركت الوفاء', email: 'info@alwafaa.com', status: 'نشط', date: '2024-03-14' },
    { id: 3, name: 'كافيه الصباح', email: 'morning@coffee.com', status: 'غير نشط', date: '2024-03-13' },
    { id: 4, name: 'صيدلية النور', email: 'pharma@alnoor.com', status: 'نشط', date: '2024-03-12' },
    { id: 5, name: 'متجر الأناقة', email: 'style@store.com', status: 'قيد المراجعة', date: '2024-03-11' },
];

export default function RecentTenantsTable() {
    const columns = useMemo(() => [
        {
            header: 'اسم المتجر',
            accessor: (tenant: any) => (
                <IdentityCell
                    name={tenant.name}
                    email={tenant.email}
                />
            ),
            exportValue: (tenant: any) => tenant.name,
            width: '45%'
        },
        {
            header: 'الحالة',
            accessor: (tenant: any) => (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl
                    ${tenant.status === 'نشط' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40' :
                        tenant.status === 'غير نشط' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40' :
                            'bg-orange-50 text-orange-600 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'نشط' ? 'bg-emerald-500 animate-pulse' :
                        tenant.status === 'غير نشط' ? 'bg-red-500' :
                            'bg-orange-500'
                        }`}></div>
                    {tenant.status}
                </span>
            ),
            exportValue: (tenant: any) => tenant.status,
            width: '20%'
        },
        {
            header: 'التاريخ',
            accessor: (tenant: any) => (
                <DateCell
                    date={tenant.date}
                    label="تاريخ الانضمام"
                />
            ),
            exportValue: (tenant: any) => tenant.date,
            width: '20%'
        },
        {
            header: '',
            accessor: () => (
                <ActionCell>
                    <button className="p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200/50 dark:border-white/5 text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-dark-800 rounded-xl transition-all shadow-sm active:scale-95">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200/50 dark:border-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-white dark:hover:bg-dark-800 rounded-xl transition-all shadow-sm active:scale-95">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </ActionCell>
            ),
            width: '15%'
        }
    ], []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">أحدث المشتركين</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">آخر المنضمين للمنصة</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-dark-800 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border border-gray-200/50 dark:border-white/5 shadow-sm">عرض الكل</button>
            </div>
            <Table
                columns={columns}
                data={recentTenants}
                exportFileName="أحدث_المشتركين_لوحة_التحكم"
            />
        </div>
    );
}
