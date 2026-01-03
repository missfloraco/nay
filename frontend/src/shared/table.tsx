import React, { useState, useEffect, useMemo } from 'react';
import {
    Database, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit3, Trash2,
    Filter, X, Search, ChevronDown, ChevronUp, History
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useExport } from '@/shared/contexts/export-context';
import { usePrint } from '@/shared/hooks/usePrint';
import PrintableTable from '@/shared/components/print/PrintableTable';
import { TableHeader, Column } from '@/shared/table-header';
import { useAction } from '@/shared/contexts/action-context';
import { formatNumber } from '@/shared/utils/helpers';
import Button from '@/shared/ui/buttons/btn-base';

// --- Types & Interfaces ---

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    exportFileName?: string;
    showExport?: boolean;
    paginationMeta?: PaginationMeta;
    onPageChange?: (page: number) => void;
    currentSort?: { column: string; order: 'asc' | 'desc' };
    onSortChange?: (column: string, order: 'asc' | 'desc') => void;
    onDelete?: (item: T) => void;
    onEdit?: (item: T) => void;
    onView?: (item: T) => void;
}

// --- Sub-Components ---

/**
 * Mobile Action Bottom Sheet
 */
const ActionSheet = ({
    isOpen,
    onClose,
    children,
    title = 'إجراءات السجل'
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:hidden">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full bg-white dark:bg-dark-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />
                <div className="px-8 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {children}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-dark-950 shrink-0">
                    <Button onClick={onClose} variant="secondary" className="w-full h-14 rounded-2xl">إغلاق</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Main Component ---

export default function Table<T>({
    columns,
    data,
    isLoading,
    emptyMessage = 'لا توجد بيانات',
    exportFileName = 'table_export',
    showExport = true,
    paginationMeta,
    onPageChange,
    currentSort,
    onSortChange,
    onDelete,
    onEdit,
    onView
}: TableProps<T>) {
    const { setExportData, isPrinting, setIsPrinting, isAnyModalOpen, openModal } = useExport();
    const { registerExtraAction, unregisterExtraAction } = useAction();
    const { printRef, handlePrint } = usePrint({ documentTitle: exportFileName });

    // UI State
    const [activeItem, setActiveItem] = useState<T | null>(null);
    const [isActionSheetOpen, setActionSheetOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [isMobile, setIsMobile] = useState(false);

    // Responsive Detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Logic Integration (Export/Print)
    const lastRegisteredRef = React.useRef<string>('');
    const printColumns = useMemo(() => columns.filter(col => col.header && !col.hideInExport).map(col => ({
        key: String(col.header), label: col.header, width: col.width, align: 'right' as const
    })), [columns]);

    const printData = useMemo(() => data.map(item => {
        const row: Record<string, any> = {};
        columns.forEach(col => {
            if (col.hideInExport) return;
            const key = String(col.header);
            if (col.exportValue) row[key] = col.exportValue(item);
            else if (typeof col.accessor !== 'function') row[key] = String(item[col.accessor as keyof T] || '');
            else row[key] = '-';
        });
        return row;
    }), [data, columns]);

    useEffect(() => {
        if (isPrinting) {
            handlePrint();
            setTimeout(() => setIsPrinting(false), 500);
        }
    }, [isPrinting, handlePrint, setIsPrinting]);

    useEffect(() => {
        if (!isLoading && data?.length > 0) {
            const columnHash = columns.map(c => c.header).join('|');
            const dataHash = `${data.length}-${exportFileName}-${columnHash}`;
            if (lastRegisteredRef.current === dataHash) return;

            const exportableColumns = columns.filter(col => col.header && !col.hideInExport).map(col => ({
                header: col.header,
                accessor: (item: T) => {
                    if (col.exportValue) return col.exportValue(item);
                    if (typeof col.accessor !== 'function') return String(item[col.accessor as keyof T] || '');
                    return '-';
                }
            }));
            if (exportableColumns.length > 0) {
                setExportData(data, exportableColumns, exportFileName);
                lastRegisteredRef.current = dataHash;
            }
        }
    }, [data, columns, isLoading, exportFileName, setExportData]);

    useEffect(() => {
        let actionId: string | null = null;
        if (showExport && data?.length > 0 && !isAnyModalOpen) {
            actionId = registerExtraAction({
                label: 'تصدير البيانات',
                onClick: openModal,
                icon: Download,
                variant: 'secondary'
            });
        }
        return () => { if (actionId) unregisterExtraAction(actionId); };
    }, [showExport, data?.length, isAnyModalOpen, openModal, registerExtraAction, unregisterExtraAction]);

    // Helpers
    const toggleRow = (idx: number) => {
        const next = new Set(expandedRows);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setExpandedRows(next);
    };

    const handleActionClick = (item: T) => {
        setActiveItem(item);
        setActionSheetOpen(true);
    };

    // --- Views ---

    const PaginationControls = () => {
        if (!paginationMeta || paginationMeta.last_page <= 1 || !onPageChange) return null;
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-dark-800 px-5 py-2.5 rounded-2xl border border-gray-100/50 dark:border-white/10 shadow-sm">
                    {paginationMeta.from}-{paginationMeta.to} من {formatNumber(paginationMeta.total)} سجل
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <Button onClick={() => onPageChange(1)} disabled={paginationMeta.current_page === 1} variant="ghost" size="sm" className="p-2.5 min-w-[40px] rounded-2xl" icon={ChevronsRight} />
                    <Button onClick={() => onPageChange(paginationMeta.current_page - 1)} disabled={paginationMeta.current_page === 1} variant="ghost" size="sm" className="p-2.5 min-w-[40px] rounded-2xl" icon={ChevronRight} />
                    <div className="px-6 flex items-center gap-1.5"><span className="text-sm font-black text-primary">{paginationMeta.current_page}</span><span className="text-[10px] font-bold text-gray-300">/</span><span className="text-sm font-bold text-gray-400">{paginationMeta.last_page}</span></div>
                    <Button onClick={() => onPageChange(paginationMeta.current_page + 1)} disabled={paginationMeta.current_page === paginationMeta.last_page} variant="ghost" size="sm" className="p-2.5 min-w-[40px] rounded-2xl" icon={ChevronLeft} />
                    <Button onClick={() => onPageChange(paginationMeta.last_page)} disabled={paginationMeta.current_page === paginationMeta.last_page} variant="ghost" size="sm" className="p-2.5 min-w-[40px] rounded-2xl" icon={ChevronsLeft} />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden animate-pulse">
                <div className="h-16 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-6 border-b border-gray-50 dark:border-white/5 flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-dark-800 rounded-2xl" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-1/4" />
                            <div className="h-4 bg-gray-50 dark:bg-dark-800/50 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[var(--radius-card)] shadow-xl shadow-gray-200/50 dark:shadow-none text-center px-6 group transition-all duration-500">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-700">
                    <Database className="w-10 h-10 text-gray-300 dark:text-dark-600 group-hover:text-primary transition-colors duration-700" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{emptyMessage}</h3>
                <p className="text-gray-400 font-bold max-w-sm leading-relaxed">لم نتمكن من العثور على أي سجلات مطابقة في قاعدة البيانات حالياً.</p>
            </div>
        );
    }

    // --- Adaptive UI Rendering ---

    return (
        <div className="space-y-6">
            <div className="premium-table-wrapper w-full bg-white dark:bg-dark-900 rounded-[var(--radius-card)] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden relative group">

                {/* 1. DESKTOP VIEW: Standard Table (Visible on MD+) */}
                <div className="hidden md:block overflow-x-auto no-scrollbar group/table">
                    <table className="w-full text-right border-collapse text-sm">
                        <TableHeader columns={columns} currentSort={currentSort} onSortChange={onSortChange} sticky={true} />
                        <tbody className="divide-y divide-gray-50/50 dark:divide-white/[0.02]">
                            {data.map((item, rowIdx) => (
                                <tr key={rowIdx} className="group/row hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04] transition-colors duration-300">
                                    {columns.map((column, colIdx) => (
                                        <td key={colIdx} className={`px-6 py-5 border-l border-gray-100/30 dark:border-white/[0.02] last:border-l-0 ${column.className || ''}`}>
                                            <div className="relative z-10 group-hover/row:scale-[1.01] transition-transform duration-300 origin-right">
                                                {typeof column.accessor === 'function' ? column.accessor(item) : (item[column.accessor as keyof T] as React.ReactNode)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 2. MOBILE VIEW: Card List (Visible on SM below MD) */}
                <div className="md:hidden divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {data.map((item, idx) => {
                        const isExpanded = expandedRows.has(idx);
                        // Priority 0 & 1 are usually primary context
                        const mainCol = columns[0];
                        const subCol = columns[1];

                        return (
                            <div key={idx} className="p-5 active:bg-gray-50 dark:active:bg-white/[0.02] transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Primary Context */}
                                    <div className="flex-1 min-w-0" onClick={() => toggleRow(idx)}>
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="text-base font-black text-gray-900 dark:text-white truncate">
                                                {typeof mainCol.accessor === 'function' ? mainCol.accessor(item) : (item[mainCol.accessor as keyof T] as React.ReactNode)}
                                            </div>
                                            {columns.length > 2 && (
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-gray-400 truncate">
                                            {typeof subCol.accessor === 'function' ? subCol.accessor(item) : (item[subCol.accessor as keyof T] as React.ReactNode)}
                                        </div>
                                    </div>

                                    {/* Quick Mobile Action Toggle */}
                                    <button
                                        onClick={() => handleActionClick(item)}
                                        className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 shadow-sm shrink-0"
                                    >
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Progressive Disclosure: Hidden Fields */}
                                {isExpanded && (
                                    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        {columns.slice(2).map((col, cIdx) => (
                                            <div key={cIdx} className="flex justify-between items-center gap-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">{col.header}</span>
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 text-left">
                                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor as keyof T] as React.ReactNode)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Inline Pagination */}
                <PaginationControls />
            </div>

            {/* Mobile Bottom Sheet for Actions */}
            <ActionSheet isOpen={isActionSheetOpen} onClose={() => setActionSheetOpen(false)}>
                {(onView || onEdit || onDelete) ? (
                    <div className="space-y-3">
                        {onView && (
                            <button
                                onClick={() => { onView(activeItem!); setActionSheetOpen(false); }}
                                className="w-full h-16 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex items-center gap-4 px-6 text-gray-700 dark:text-gray-200 font-bold hover:bg-primary hover:text-white transition-all group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-white group-hover:text-rose-500 transition-colors">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <span className="flex-1 text-right">عرض التفاصيل الكاملة</span>
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => { onEdit(activeItem!); setActionSheetOpen(false); }}
                                className="w-full h-16 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex items-center gap-4 px-6 text-gray-700 dark:text-gray-200 font-bold hover:bg-emerald-500 hover:text-white transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <span className="flex-1 text-right">تعديل البيانات</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => {
                                    // Soft Delete Logic: Direct action + feedback elsewhere
                                    onDelete(activeItem!);
                                    setActionSheetOpen(false);
                                }}
                                className="w-full h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-500/10 flex items-center gap-4 px-6 text-rose-600 dark:text-rose-400 font-black hover:bg-rose-600 hover:text-white transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-white group-hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-right flex flex-col items-end">
                                    <span>نقل لسلة المهملات</span>
                                    <span className="text-[10px] opacity-70 font-bold">حذف ناعم وتلقائي</span>
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <Database className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 font-bold">لا توجد إجراءات إضافية متاحة لهذا السجل</p>
                    </div>
                )}
            </ActionSheet>

            {/* Hidden Printable Version */}
            <div style={{ display: 'none' }}>
                <PrintableTable ref={printRef} title={exportFileName.replace(/_/g, ' ')} columns={printColumns} data={printData} />
            </div>
        </div>
    );
}
