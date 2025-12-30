import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '@/features/superadmin/pages/adminlayout';
import AppLayout from '@/features/tenant/pages/applayout';
import { useTrash } from '@/shared/hooks/use-trash';
import { useSettings } from '@/shared/contexts/app-context';
import { formatDate } from '@/shared/utils/helpers';
import { TEXTS_ADMIN } from '@/shared/locales/texts';
import Table from '@/shared/table';
import { Trash2, RotateCcw, CheckSquare, Square, AlertTriangle, Settings2 } from 'lucide-react';
import { IdentityCell, DateCell, ActionCell } from '@/shared/table-cells';
import type { TrashedItem } from '@/shared/types/trash';
import { Drawer } from '@/shared/ui/drawer';

export default function Trash() {
    const location = useLocation();
    const { t } = useSettings();
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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

    // Sidebar/Drawer Content
    const optionsContent = (
        <div className="space-y-8 p-1">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Trash2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">خيارات السلة</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">إحصائيات وتحكم سريع</p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-50 dark:bg-dark-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-dark-800">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
                    إجمالي المحذوفات
                </span>
                <p className="text-5xl font-black text-primary tracking-tighter">{trash.stats.total}</p>
                <p className="text-xs text-gray-400 font-bold mt-3">
                    عنصر ينتظر المعالجة
                </p>
            </div>

            {/* Type Classification */}
            {Object.keys(trash.stats.byType).length > 0 && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                        التصنيف حسب النوع
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(trash.stats.byType).map(([type, count]) => (
                            <div
                                key={type}
                                className="flex items-center justify-between p-4 bg-white dark:bg-dark-800/60 rounded-2xl border border-gray-100 dark:border-dark-700/50"
                            >
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {getTypeLabel(type)}
                                </span>
                                <span className="px-3 py-1 bg-gray-50 dark:bg-dark-950 rounded-lg text-[10px] font-black text-primary border border-gray-100 dark:border-dark-700">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-gray-100 dark:border-dark-800 space-y-3">
                {/* Empty Trash Button */}
                {trash.stats.total > 0 && (
                    <button
                        onClick={() => {
                            trash.emptyTrash();
                            setIsOptionsOpen(false);
                        }}
                        className="w-full h-14 flex items-center justify-center gap-3 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-500/10 group active:scale-[0.98]"
                    >
                        <AlertTriangle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        إفراغ السلة نهائياً
                    </button>
                )}

                {/* Bulk Actions */}
                {trash.selected.length > 0 && (
                    <>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 pt-2">
                            تحكم بالمحدد ({trash.selected.length})
                        </p>
                        <button
                            onClick={() => {
                                trash.bulkRestore();
                                setIsOptionsOpen(false);
                            }}
                            className="w-full h-14 flex items-center justify-center gap-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10"
                        >
                            <RotateCcw className="w-5 h-5" />
                            استعادة العناصر المحددة
                        </button>
                        <button
                            onClick={() => {
                                trash.bulkForceDelete();
                                setIsOptionsOpen(false);
                            }}
                            className="w-full h-14 flex items-center justify-center gap-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-100 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                            حذف العناصر المحددة نهائياً
                        </button>
                    </>
                )}
            </div>
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
                <div className="flex items-center gap-3 px-4 py-2">
                    <button
                        onClick={trash.selectAll}
                        className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-dark-800 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all active:scale-95"
                    >
                        {trash.selected.length === trash.items.length ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        <span>
                            {trash.selected.length === trash.items.length ? 'إلغاء تحديد الكل' : 'تحديد جميع المعروض'}
                        </span>
                    </button>
                    {trash.selected.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            {trash.selected.length} محدد حالياً
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 flex flex-col bg-transparent">
                <Table<TrashedItem>
                    columns={columns}
                    data={trash.items}
                    isLoading={trash.isLoading}
                    emptyMessage="السلة فارغة حالياً"
                    exportFileName="سلة_المحذوفات"
                />
            </div>

            <Drawer
                isOpen={isOptionsOpen}
                onClose={() => setIsOptionsOpen(false)}
                title="خيارات السلة"
            >
                {optionsContent}
            </Drawer>
        </div>
    );

    const HeaderAction = (
        <button
            onClick={() => setIsOptionsOpen(true)}
            className="flex items-center gap-2 px-6 h-12 bg-white dark:bg-dark-800 border-2 border-gray-100 dark:border-dark-700 rounded-2xl text-sm font-black text-gray-700 dark:text-gray-200 hover:border-primary/30 hover:text-primary transition-all active:scale-95 shadow-sm shadow-gray-200/50"
        >
            <Settings2 size={18} className="text-primary" />
            <span>خيارات السلة</span>
            {trash.selected.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] rounded-full">
                    {trash.selected.length}
                </span>
            )}
        </button>
    );

    // Render with appropriate layout
    if (isAdmin) {
        return (
            <AdminLayout
                title={TEXTS_ADMIN?.TITLES?.RECYCLE_BIN || 'سلة المهملات'}
                actions={HeaderAction}
                hideLeftSidebar={true}
            >
                {tableContent}
            </AdminLayout>
        );
    } else {
        return (
            <AppLayout
                title={t('trash.title', 'سلة المحذوفات')}
                actions={HeaderAction}
                hideLeftSidebar={true}
            >
                {tableContent}
            </AppLayout>
        );
    }
}
