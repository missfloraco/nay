import React, { forwardRef } from 'react';
import PrintLayout from '@/shared/components/print/PrintLayout';

interface Transaction {
    id: string | number;
    date: string;
    description: string;
    debit?: number;
    credit?: number;
    balance: number;
}

interface PrintableStatementProps {
    accountHolder: string;
    accountNumber?: string;
    statementPeriod: string;
    openingBalance: number;
    closingBalance: number;
    transactions: Transaction[];
    totalDebits?: number;
    totalCredits?: number;
}

/**
 * Printable Statement Component
 * For account statements and transaction history
 */
export const PrintableStatement = forwardRef<HTMLDivElement, PrintableStatementProps>(
    ({ accountHolder, accountNumber, statementPeriod, openingBalance, closingBalance, transactions, totalDebits, totalCredits }, ref) => {
        return (
            <PrintLayout ref={ref} title="كشف حساب">
                {/* Account Info */}
                <div className="print-grid-2 avoid-break" style={{ marginBottom: '24pt' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8pt 0', fontSize: '14pt' }}>معلومات الحساب</h3>
                        <p style={{ margin: '4pt 0' }}>
                            <strong>اسم صاحب الحساب:</strong> {accountHolder}
                        </p>
                        {accountNumber && (
                            <p style={{ margin: '4pt 0' }}>
                                <strong>رقم الحساب:</strong> {accountNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 8pt 0', fontSize: '14pt' }}>فترة الكشف</h3>
                        <p style={{ margin: '4pt 0' }}>{statementPeriod}</p>
                    </div>
                </div>

                {/* Opening Balance */}
                <div className="avoid-break" style={{ marginBottom: '16pt', padding: '12pt', backgroundColor: '#e3f2fd' }}>
                    <div className="print-flex">
                        <strong>الرصيد الافتتاحي:</strong>
                        <strong>{openingBalance.toFixed(2)}</strong>
                    </div>
                </div>

                {/* Transactions Table */}
                <table style={{ marginBottom: '16pt' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>التاريخ</th>
                            <th style={{ width: '40%' }}>الوصف</th>
                            <th style={{ width: '15%' }}>مدين</th>
                            <th style={{ width: '15%' }}>دائن</th>
                            <th style={{ width: '15%' }}>الرصيد</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="table-row">
                                <td style={{ textAlign: 'center' }}>{transaction.date}</td>
                                <td>{transaction.description}</td>
                                <td style={{ textAlign: 'left', color: transaction.debit ? '#d32f2f' : '#999' }}>
                                    {transaction.debit ? transaction.debit.toFixed(2) : '-'}
                                </td>
                                <td style={{ textAlign: 'left', color: transaction.credit ? '#388e3c' : '#999' }}>
                                    {transaction.credit ? transaction.credit.toFixed(2) : '-'}
                                </td>
                                <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                                    {transaction.balance.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="avoid-break" style={{ marginRight: 'auto', width: '50%' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {totalDebits !== undefined && (
                                <tr>
                                    <td style={{ border: 'none', textAlign: 'right', padding: '4pt 8pt' }}>
                                        <strong>إجمالي المدين:</strong>
                                    </td>
                                    <td style={{ border: 'none', textAlign: 'left', padding: '4pt 8pt', color: '#d32f2f' }}>
                                        {totalDebits.toFixed(2)}
                                    </td>
                                </tr>
                            )}

                            {totalCredits !== undefined && (
                                <tr>
                                    <td style={{ border: 'none', textAlign: 'right', padding: '4pt 8pt' }}>
                                        <strong>إجمالي الدائن:</strong>
                                    </td>
                                    <td style={{ border: 'none', textAlign: 'left', padding: '4pt 8pt', color: '#388e3c' }}>
                                        {totalCredits.toFixed(2)}
                                    </td>
                                </tr>
                            )}

                            <tr style={{ borderTop: '2px solid #000' }}>
                                <td style={{ border: 'none', textAlign: 'right', padding: '8pt 8pt', fontSize: '14pt' }}>
                                    <strong>الرصيد الختامي:</strong>
                                </td>
                                <td style={{ border: 'none', textAlign: 'left', padding: '8pt 8pt', fontSize: '14pt' }}>
                                    <strong style={{ color: closingBalance >= 0 ? '#388e3c' : '#d32f2f' }}>
                                        {closingBalance.toFixed(2)}
                                    </strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Transaction Count */}
                <div style={{ marginTop: '16pt', fontSize: '10pt', color: '#666', textAlign: 'left' }}>
                    عدد العمليات: {transactions.length}
                </div>
            </PrintLayout>
        );
    }
);

PrintableStatement.displayName = 'PrintableStatement';

export default PrintableStatement;
