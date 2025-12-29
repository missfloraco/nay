import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    exportValue?: (item: T) => string | number;
    hideInExport?: boolean;
    width?: string;
    className?: string;
    sortable?: boolean;
    sortKey?: string;
}

interface TableHeaderProps<T> {
    columns: Column<T>[];
    currentSort?: { column: string; order: 'asc' | 'desc' };
    onSortChange?: (column: string, order: 'asc' | 'desc') => void;
    sticky?: boolean;
}

export function TableHeader<T>({
    columns,
    currentSort,
    onSortChange,
    sticky = false
}: TableHeaderProps<T>) {
    return (
        <thead className={sticky ? "sticky top-0 z-20" : ""}>
            <tr className="bg-gray-50/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-sm">
                {columns.map((column, idx) => {
                    const sortKey = column.sortKey || (typeof column.accessor === 'string' ? String(column.accessor) : '');
                    const isSorted = currentSort?.column === sortKey && sortKey !== '';
                    const isAsc = isSorted && currentSort?.order === 'asc';
                    const isDesc = isSorted && currentSort?.order === 'desc';

                    const handleSort = () => {
                        if (!column.sortable || !onSortChange || !sortKey) return;
                        const newOrder = isSorted && isAsc ? 'desc' : 'asc';
                        onSortChange(sortKey, newOrder);
                    };

                    return (
                        <th
                            key={idx}
                            className={`px-6 py-5 text-[12px] font-black text-primary uppercase tracking-[0.2em] border-l border-gray-200/50 dark:border-white/5 last:border-l-0 ${column.sortable ? 'cursor-pointer hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors select-none' : ''
                                } ${column.className || ''}`}
                            style={{ width: column.width }}
                            onClick={handleSort}
                        >
                            <div className="flex items-center justify-start gap-2">
                                <span>{column.header}</span>
                                {column.sortable && (
                                    <div className="flex flex-col">
                                        {!isSorted && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                        {isAsc && <ArrowUp className="w-3 h-3 text-primary" />}
                                        {isDesc && <ArrowDown className="w-3 h-3 text-primary" />}
                                    </div>
                                )}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
