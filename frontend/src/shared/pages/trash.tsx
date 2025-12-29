import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import { useTrash } from '@/shared/hooks/use-trash';
import { useSettings } from '@/shared/contexts/app-context';
import { formatDate } from '@/shared/utils/helpers';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import Table from '@/shared/table';
import DateTimeSeparator from '@/shared/ui/dates/date-time-separator';
import { Trash2, RotateCcw, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';
import type { TrashedItem } from '@/shared/types/trash';

export default function Trash() {
    const location = useLocation();
    const { t } = useSettings();

    // Determine if admin or tenant based on route
    const isAdmin = location.pathname.startsWith('/admin');
    const endpoint = isAdmin ? '/admin/trash' : '/app/trash';

    const trash = useTrash({ endpoint });

    const getTypeLabel = (type: string) => {
        if (isAdmin) {
            const labels: Record<string, string> = {
                'tenants': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.TENANTS || 'المستأجرين',
                'fonts': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.FONTS || 'الخطوط',
                'languages': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.LANGUAGES || 'اللغات',
                'translations': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.TRANSLATIONS || 'الترجمات',
                'users': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.USERS || 'المستخدمين',
                'ads': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.ADS || 'الإعلانات',
                'support_tickets': TEXTS_ADMIN?.RECYCLE_BIN?.TYPES?.SUPPORT_TICKETS || 'تذاكر الدعم',
            };
            return labels[type] || type;
        } else {
            const labels: Record<string, string> = {
                'support_tickets': 'تذاكر الدعم',
                'messages': 'الرسائل',
                'files': 'الملفات',
            };
            return labels[type] || type;
        }
    };

    const isSelected = (item: TrashedItem) => {
        return trash.selected.some(i => i.type === item.type && i.id === item.id);
    };

    // Left Sidebar Content - All trash functionality
    const leftSidebarContent = (
        <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">
                        إحصائيات السلة
                    </span>
                </div>
                <p className="text-4xl font-black text-primary tracking-tighter">{trash.stats.total}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-2">
                    إجمالي العناصر المحذوفة
                </p>
            </div>

            {/* Type Classification */}
            {Object.keys(trash.stats.byType).length > 0 && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                        التصنيف
                    </label>
                    <div className="space-y-2">
                        {Object.entries(trash.stats.byType).map(([type, count]) => (
                            <div
                                key={type}
                                className="flex items-center justify-between p-3 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700"
                            >
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {getTypeLabel(type)}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-50 dark:bg-dark-900 rounded-lg text-[10px] font-black text-primary border border-gray-100 dark:border-dark-700">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty Trash Button */}
            {trash.stats.total > 0 && (
                <button
                    onClick={trash.emptyTrash}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 group active:scale-[0.98]"
                >
                    <AlertTriangle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    إفراغ السلة نهائياً
                </button>
            )}

            {/* Bulk Actions */}
            {trash.selected.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-dark-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                        {trash.selected.length} محدد
                    </p>
                    <button
                        onClick={trash.bulkRestore}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        استعادة المحدد
                    </button>
                    <button
                        onClick={trash.bulkForceDelete}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        حذف المحدد نهائياً
                    </button>
                </div>
            )}
        </div>
    );

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
        <div className="space-y-4 animate-in fade-in duration-700 h-full flex flex-col">
            {/* Select All Checkbox */}
            {trash.items.length > 0 && (
                <div className="flex items-center gap-3 px-4">
                    <button
                        onClick={trash.selectAll}
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        {trash.selected.length === trash.items.length ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        <span>
                            {trash.selected.length === trash.items.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </span>
                    </button>
                    {trash.selected.length > 0 && (
                        <span className="text-xs text-gray-400">
                            ({trash.selected.length} محدد)
                        </span>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 flex flex-col bg-transparent">
                <Table<TrashedItem>
                    columns={columns}
                    data={trash.items}
                    isLoading={trash.isLoading}
                    emptyMessage="السلة فارغة"
                    exportFileName="سلة_المحذوفات"
                />
            </div>
        </div>
    );

    // Render with appropriate layout
    if (isAdmin) {
        return (
            <AdminLayout
                title={TEXTS_ADMIN?.TITLES?.RECYCLE_BIN || 'سلة المهملات'}
                leftSidebarContent={leftSidebarContent}
            >
                {tableContent}
            </AdminLayout>
        );
    } else {
        return (
            <AppLayout
                title={t('trash.title', 'سلة المحذوفات')}
                leftSidebarContent={leftSidebarContent}
            >
                {tableContent}
            </AppLayout>
        );
    }
}
