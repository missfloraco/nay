import React, { useState } from 'react';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import { useTrash } from '@/shared/hooks/use-trash';
import { useAction } from '@/shared/contexts/action-context';
import { formatDate } from '@/shared/utils/helpers';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import Table from '@/shared/table';
import { Trash2, RotateCcw, CheckSquare, Square, AlertTriangle, Download } from 'lucide-react';
import { useExport } from '@/shared/contexts/export-context';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';
import type { TrashedItem } from '@/shared/types/trash';

export default function AdminTrash() {
    const endpoint = '/admin/trash';
    const trash = useTrash({ endpoint });

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'tenants': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.TENANTS || 'المستأجرين',
            'fonts': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.FONTS || 'الخطوط',
            'languages': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.LANGUAGES || 'اللغات',
            'translations': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.TRANSLATIONS || 'الترجمات',
            'users': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.USERS || 'المستخدمين',
            'ads': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.ADS || 'الإعلانات',
            'scripts': 'السكربتات',
            'plans': 'الخطط السعرية',
            'payments': 'سجل المدفوعات',
            'subscription_requests': 'طلبات الاشتراك',
            'support_tickets': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.SUPPORT_TICKETS || 'تذاكر الدعم',
        };
        return labels[type] || type;
    };

    const isSelected = (item: TrashedItem) => {
        return trash.selected.some(i => i.type === item.type && i.id === item.id);
    };

    // Sidebar/Drawer Content
    const { setPrimaryAction, setExtraActions } = useAction();
    const { openModal } = useExport();

    React.useEffect(() => {
        if (trash.selected.length > 0) {
            // Bulk Selection Mode
            setPrimaryAction({
                label: `استعادة المحدد (${trash.selected.length})`,
                onClick: trash.bulkRestore,
                icon: RotateCcw,
                variant: 'primary',
                disabled: trash.isLoading
            });

            setExtraActions([
                {
                    label: 'حذف المحدد نهائياً',
                    onClick: trash.bulkForceDelete,
                    icon: Trash2,
                    variant: 'danger',
                    disabled: trash.isLoading
                },
                {
                    label: trash.selected.length === trash.items.length ? 'إلغاء تحديد الكل' : 'تحديد الكل',
                    onClick: trash.selectAll,
                    icon: trash.selected.length === trash.items.length ? CheckSquare : Square,
                    variant: 'secondary'
                }
            ]);
        } else {
            // Default Mode: Empty Trash
            setPrimaryAction({
                label: 'إفراغ السلة نهائياً',
                onClick: trash.emptyTrash,
                icon: AlertTriangle,
                variant: 'danger',
                disabled: trash.stats.total === 0 || trash.isLoading
            });

            // Extra Action: Export (Only if items exist)
            if (trash.items.length > 0) {
                setExtraActions([
                    {
                        label: 'تصدير البيانات',
                        onClick: openModal,
                        icon: Download,
                        variant: 'secondary'
                    },
                    {
                        label: 'تحديد الكل',
                        onClick: trash.selectAll,
                        icon: Square,
                        variant: 'secondary'
                    }
                ]);
            } else {
                setExtraActions([]);
            }
        }

        return () => {
            setPrimaryAction(null);
            setExtraActions([]);
        };
    }, [
        trash.stats.total,
        trash.items.length,
        trash.selected.length,
        trash.isLoading,
        trash.bulkRestore,
        trash.bulkForceDelete,
        trash.emptyTrash,
        setPrimaryAction,
        setExtraActions,
        openModal
    ]);

    const columns = React.useMemo(() => [
        {
            header: '',
            accessor: (item: TrashedItem) => (
                <button
                    onClick={() => trash.toggleSelect(item)}
                    className="w-5 h-5 flex items-center justify-center"
                >
                    {isSelected(item) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                        <Square className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                    )}
                </button>
            ),
            width: '5%'
        },
        {
            header: 'العنصر',
            accessor: (item: TrashedItem) => (
                <IdentityCell
                    name={item.display_name}
                    subtext={`${item.type.toUpperCase().slice(0, 3)}-${item.id.toString().padStart(4, '0')}`}
                />
            ),
            exportValue: (item: TrashedItem) => item.display_name,
            width: '35%'
        },
        {
            header: 'النوع',
            accessor: (item: TrashedItem) => (
                <span className="inline-flex items-center px-4 py-1.5 bg-gray-50 dark:bg-dark-900 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-dark-700 text-[10px] font-black uppercase tracking-tight rounded-lg">
                    {getTypeLabel(item.type)}
                </span>
            ),
            exportValue: (item: TrashedItem) => getTypeLabel(item.type),
            width: '15%'
        },
        {
            header: 'تاريخ الحذف',
            accessor: (item: TrashedItem) => (
                <DateCell date={item.deleted_at} includeTime={true} />
            ),
            exportValue: (item: TrashedItem) => formatDate(item.deleted_at),
            width: '25%'
        },
        {
            header: 'الإجراءات',
            accessor: (item: TrashedItem) => (
                <ActionCell>
                    <button
                        onClick={() => trash.restore(item.type, item.id)}
                        className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="استعادة"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => trash.forceDelete(item.type, item.id)}
                        className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="حذف نهائي"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </ActionCell>
            ),
            width: '20%'
        }
    ], [trash.toggleSelect, trash.restore, trash.forceDelete, trash.selected, getTypeLabel]);

    const tableContent = (
        <div className="space-y-6 animate-in fade-in duration-700 w-full flex flex-col">
            {/* Select All Checkbox */}


            {/* Table */}
            <div className="flex-1 flex flex-col bg-transparent">
                <Table<TrashedItem>
                    columns={columns}
                    data={trash.items}
                    isLoading={trash.isLoading}
                    emptyMessage="السلة فارغة حالياً"
                    exportFileName="سلة_المحذوفات"
                    showExport={false}
                />
            </div>

        </div>
    );

    return (
        <AdminLayout
            title={TEXTS_ADMIN?.TITLES?.RECYCLE_BIN || 'سلة المهملات'}
            icon={Trash2}
        >
            <div className="p-8">
                {tableContent}
            </div>
        </AdminLayout>
    );
}
