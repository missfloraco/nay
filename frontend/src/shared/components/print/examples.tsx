/**
 * PRINTING SYSTEM - USAGE EXAMPLES
 * 
 * This file demonstrates how to use the centralized printing system
 * with react-to-print for various document types.
 */

import React, { useRef } from 'react';
import { usePrint } from '@/shared/hooks/usePrint';
import {
    PrintableInvoice,
    PrintableTable,
    PrintableReport,
    PrintableStatement
} from '@/shared/components/print';

// ============================================
// EXAMPLE 1: Print Invoice
// ============================================
function InvoiceExample() {
    const { printRef, handlePrint } = usePrint({
        documentTitle: 'Invoice-INV-001'
    });

    const invoiceData = {
        invoice_number: 'INV-001',
        invoice_date: '2025-12-28',
        due_date: '2026-01-28',
        customer_name: 'شركة المثال',
        customer_address: 'الرياض، المملكة العربية السعودية',
        customer_phone: '+966 50 123 4567',
        items: [
            { id: 1, description: 'منتج 1', quantity: 2, unit_price: 100, total: 200 },
            { id: 2, description: 'منتج 2', quantity: 1, unit_price: 150, total: 150 },
        ],
        subtotal: 350,
        tax: 52.5,
        tax_rate: 15,
        discount: 0,
        total: 402.5,
        notes: 'شكراً لتعاملكم معنا',
        payment_terms: 'الدفع خلال 30 يوم'
    };

    return (
        <>
            {/* On-screen UI */}
            <button onClick={handlePrint} className="no-print">
                طباعة الفاتورة
            </button>

            {/* Hidden printable version */}
            <div style={{ display: 'none' }}>
                <PrintableInvoice ref={printRef} data={invoiceData} />
            </div>
        </>
    );
}

// ============================================
// EXAMPLE 2: Print Table/Report
// ============================================
function TableExample() {
    const { printRef, handlePrint } = usePrint({
        documentTitle: 'Sales-Report'
    });

    const columns = [
        { key: 'date', label: 'التاريخ', width: '20%' },
        { key: 'product', label: 'المنتج', width: '40%' },
        { key: 'quantity', label: 'الكمية', width: '15%', align: 'center' as const },
        { key: 'amount', label: 'المبلغ', width: '25%', align: 'left' as const, render: (val: number) => val.toFixed(2) }
    ];

    const data = [
        { date: '2025-12-01', product: 'منتج أ', quantity: 10, amount: 1000 },
        { date: '2025-12-02', product: 'منتج ب', quantity: 5, amount: 750 },
        // ... more rows
    ];

    const totalRow = {
        date: '',
        product: 'الإجمالي',
        quantity: 15,
        amount: '1750.00'
    };

    return (
        <>
            <button onClick={handlePrint} className="no-print">
                طباعة التقرير
            </button>

            <div style={{ display: 'none' }}>
                <PrintableTable
                    ref={printRef}
                    title="تقرير المبيعات"
                    columns={columns}
                    data={data}
                    showTotals={true}
                    totalRow={totalRow}
                    summary="تقرير المبيعات لشهر ديسمبر 2025"
                />
            </div>
        </>
    );
}

// ============================================
// EXAMPLE 3: Print Custom Report
// ============================================
function ReportExample() {
    const { printRef, handlePrint } = usePrint({
        documentTitle: 'Monthly-Report'
    });

    const sections = [
        {
            title: 'ملخص المبيعات',
            content: (
                <div>
                    <p>إجمالي المبيعات: 50,000 ريال</p>
                    <p>عدد الفواتير: 120</p>
                </div>
            )
        },
        {
            title: 'أفضل المنتجات',
            content: (
                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>المبيعات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>منتج أ</td><td>15,000</td></tr>
                        <tr><td>منتج ب</td><td>12,000</td></tr>
                    </tbody>
                </table>
            )
        }
    ];

    return (
        <>
            <button onClick={handlePrint} className="no-print">
                طباعة التقرير
            </button>

            <div style={{ display: 'none' }}>
                <PrintableReport
                    ref={printRef}
                    title="التقرير الشهري"
                    dateRange="1 ديسمبر 2025 - 31 ديسمبر 2025"
                    summary="تقرير شامل لأداء المبيعات خلال شهر ديسمبر"
                    sections={sections}
                    footer="هذا التقرير تم إنشاؤه تلقائياً من النظام"
                />
            </div>
        </>
    );
}

// ============================================
// EXAMPLE 4: Print Statement
// ============================================
function StatementExample() {
    const { printRef, handlePrint } = usePrint({
        documentTitle: 'Account-Statement'
    });

    const transactions = [
        { id: 1, date: '2025-12-01', description: 'فاتورة #001', debit: 500, balance: 9500 },
        { id: 2, date: '2025-12-05', description: 'دفعة', credit: 1000, balance: 10500 },
        { id: 3, date: '2025-12-10', description: 'فاتورة #002', debit: 300, balance: 10200 },
    ];

    return (
        <>
            <button onClick={handlePrint} className="no-print">
                طباعة كشف الحساب
            </button>

            <div style={{ display: 'none' }}>
                <PrintableStatement
                    ref={printRef}
                    accountHolder="شركة المثال"
                    accountNumber="ACC-12345"
                    statementPeriod="1 ديسمبر 2025 - 31 ديسمبر 2025"
                    openingBalance={10000}
                    closingBalance={10200}
                    transactions={transactions}
                    totalDebits={800}
                    totalCredits={1000}
                />
            </div>
        </>
    );
}

export { InvoiceExample, TableExample, ReportExample, StatementExample };
