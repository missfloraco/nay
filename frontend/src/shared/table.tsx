import React from 'react';
import { Database, Loader2, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { useExport } from '@/shared/contexts/export-context';
import { usePrint } from '@/shared/hooks/usePrint';
import PrintableTable from '@/shared/components/print/PrintableTable';

import { TableHeader, Column } from './table-header';

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
    // Pagination props
    paginationMeta?: PaginationMeta;
    onPageChange?: (page: number) => void;
    // Sorting props
    currentSort?: { column: string; order: 'asc' | 'desc' };
    onSortChange?: (column: string, order: 'asc' | 'desc') => void;
}

interface SkeletonRowProps {
    columns: any[];
    key?: React.Key;
}

const SkeletonRow = ({ columns }: SkeletonRowProps) => (
    <tr className="animate-pulse">
        {columns.map((_, idx) => (
            <td key={idx} className="px-6 py-5 border-l border-gray-100/50 dark:border-white/5 last:border-l-0">
                <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded-lg w-full" />
            </td>
        ))}
    </tr>
);

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
    onSortChange
}: TableProps<T>) {
    const { setExportData, isPrinting, setIsPrinting, openModal } = useExport();
    const { printRef, handlePrint } = usePrint({
        documentTitle: exportFileName
    });

    const lastRegisteredRef = React.useRef<string>('');

    // Prepare print columns
    const printColumns = React.useMemo(() => {
        return columns
            .filter(col => col.header) // Keep all named columns
            .map(col => ({
                key: String(col.header),
                label: col.header,
                width: col.width,
                align: 'right' as const
            }));
    }, [columns]);

    // Prepare print data
    const printData = React.useMemo(() => {
        return data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                const key = String(col.header);
                if (col.exportValue) {
                    row[key] = col.exportValue(item);
                } else if (typeof col.accessor !== 'function') {
                    row[key] = String(item[col.accessor as keyof T] || '');
                } else {
                    // If it's a function and no export value, check common fields or return empty
                    // We try to find if the accessor name contains a hint but we can't reliably
                    row[key] = '-';
                }
            });
            return row;
        });
    }, [data, columns]);

    // Handle print trigger from export context
    React.useEffect(() => {
        if (isPrinting) {
            handlePrint();
            // Reset printing state after a short delay
            setTimeout(() => setIsPrinting(false), 500);
        }
    }, [isPrinting, handlePrint, setIsPrinting]);

    React.useEffect(() => {
        if (!isLoading && data && data.length > 0) {
            // Check if we've already registered this specific data/columns combo
            // We use a hash-like strategy with JSON.stringify on headers and data length
            const columnHash = columns.map(c => c.header).join('|');
            const dataHash = `${data.length}-${exportFileName}-${columnHash}`;

            if (lastRegisteredRef.current === dataHash) return;

            // Prepare columns for export
            const exportableColumns = columns
                .filter(col => col.header) // Include all columns with a header
                .map(col => ({
                    header: col.header,
                    accessor: (item: T) => {
                        if (col.exportValue) return col.exportValue(item);
                        if (typeof col.accessor !== 'function') return String(item[col.accessor as keyof T] || '');
                        return '-'; // Placeholder for complex UI columns without data mapping
                    }
                }));

            if (exportableColumns.length > 0) {
                setExportData(data, exportableColumns, exportFileName);
                lastRegisteredRef.current = dataHash;
            }
        }
    }, [data, columns, isLoading, exportFileName, setExportData]);

    // Cleanup ONLY on actual unmount
    React.useEffect(() => {
        return () => {
            setExportData(null);
        };
    }, [setExportData]);

    if (isLoading) {
        return (
            <div className="standard-table-container w-full overflow-hidden rounded-none">
                <table className="w-full text-right border-collapse">
                    <TableHeader<T>
                        columns={columns}
                        currentSort={currentSort}
                        onSortChange={onSortChange}
                    />
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <SkeletonRow key={i} columns={columns} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/30 dark:bg-white/[0.02] border-2 border-dashed border-gray-200/60 dark:border-white/5 rounded-none text-center px-6 group transition-all duration-500 hover:border-primary/30">
                <div className="w-20 h-20 bg-white dark:bg-dark-900 rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-gray-100 dark:border-white/5">
                    <Database className="w-9 h-9 text-gray-300 dark:text-dark-600 group-hover:text-primary transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{emptyMessage}</h3>
                <p className="text-sm text-gray-400 font-bold max-w-[250px]">لم يتم العثور على أي سجلات في هذه القائمة حالياً</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="standard-table-container w-full rounded-none transition-all duration-500">
                <table className="standard-table w-full text-right border-collapse text-sm">
                    <TableHeader<T>
                        columns={columns}
                        currentSort={currentSort}
                        onSortChange={onSortChange}
                        sticky={true}
                    />
                    <tbody className="divide-y divide-gray-100/80 dark:divide-white/5">
                        {data.map((item, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300"
                            >
                                {columns.map((column, colIdx) => (
                                    <td
                                        key={colIdx}
                                        data-label={column.header}
                                        className={`px-6 py-5 border-l border-gray-100/50 dark:border-white/5 last:border-l-0 transition-colors duration-300 group-hover:border-primary/10 ${column.className || ''}`}
                                    >
                                        <div className="relative z-10">
                                            {typeof column.accessor === 'function'
                                                ? column.accessor(item)
                                                : (item[column.accessor as keyof T] as React.ReactNode)}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Subtle Scroll Indicator Shadow */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white dark:from-dark-900 to-transparent pointer-events-none opacity-0 lg:group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white dark:from-dark-900 to-transparent pointer-events-none opacity-0 lg:group-hover:opacity-100 transition-opacity" />

                {/* Hidden Printable Version */}
                <div style={{ display: 'none' }}>
                    <PrintableTable
                        ref={printRef}
                        title={exportFileName.replace(/_/g, ' ')}
                        columns={printColumns}
                        data={printData}
                    />
                </div>
            </div>

            {/* Table Footer Actions */}
            {showExport && data.length > 0 && (
                <div className="flex justify-start px-2">
                    <button
                        onClick={openModal}
                        className="group flex items-center gap-3 px-6 py-2.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 active:scale-95"
                    >
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Download className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">تصدير البيانات</span>
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {paginationMeta && paginationMeta.last_page > 1 && onPageChange && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30 dark:bg-white/[0.02] border-t border-gray-200/60 dark:border-white/5 rounded-none">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                        عرض {paginationMeta.from || 0} - {paginationMeta.to || 0} من أصل {paginationMeta.total}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={paginationMeta.current_page === 1}
                            className="p-2 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
                            title="الصفحة الأولى"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(paginationMeta.current_page - 1)}
                            disabled={paginationMeta.current_page === 1}
                            className="p-2 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
                            title="السابق"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl">
                            {paginationMeta.current_page} / {paginationMeta.last_page}
                        </div>
                        <button
                            onClick={() => onPageChange(paginationMeta.current_page + 1)}
                            disabled={paginationMeta.current_page === paginationMeta.last_page}
                            className="p-2 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
                            title="التالي"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(paginationMeta.last_page)}
                            disabled={paginationMeta.current_page === paginationMeta.last_page}
                            className="p-2 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
                            title="الصفحة الأخيرة"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
