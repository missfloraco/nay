import React, { forwardRef } from 'react';
import PrintLayout from '@/shared/components/print/PrintLayout';

interface TableColumn {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
}

interface PrintableTableProps {
    title?: string;
    columns: TableColumn[];
    data: any[];
    showTotals?: boolean;
    totalRow?: Record<string, any>;
    summary?: string;
}

/**
 * Printable Table Component
 * Generic table for reports with automatic page breaks
 */
export const PrintableTable = forwardRef<HTMLDivElement, PrintableTableProps>(
    ({ title, columns, data, showTotals = false, totalRow, summary }, ref) => {
        return (
            <PrintLayout ref={ref} title={title}>
                {/* Summary */}
                {summary && (
                    <div className="avoid-break" style={{ marginBottom: '16pt', padding: '12pt', backgroundColor: '#f5f5f5' }}>
                        <p style={{ margin: 0, fontSize: '11pt' }}>{summary}</p>
                    </div>
                )}

                {/* Data Table */}
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{
                                        width: col.width,
                                        textAlign: col.align || 'right'
                                    }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className="table-row">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        style={{ textAlign: col.align || 'right' }}
                                    >
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>

                    {/* Totals Row */}
                    {showTotals && totalRow && (
                        <tfoot>
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        style={{ textAlign: col.align || 'right' }}
                                    >
                                        {totalRow[col.key] || ''}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>

                {/* Record Count */}
                <div style={{ marginTop: '16pt', fontSize: '10pt', color: '#666', textAlign: 'left' }}>
                    إجمالي السجلات: {data.length}
                </div>
            </PrintLayout>
        );
    }
);

PrintableTable.displayName = 'PrintableTable';

export default PrintableTable;
