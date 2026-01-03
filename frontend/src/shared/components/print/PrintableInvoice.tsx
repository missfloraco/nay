import React, { forwardRef } from 'react';
import PrintLayout from '@/shared/components/print/PrintLayout';

interface InvoiceItem {
    id: string | number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface InvoiceData {
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    customer_name: string;
    customer_address?: string;
    customer_phone?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax?: number;
    tax_rate?: number;
    discount?: number;
    total: number;
    notes?: string;
    payment_terms?: string;
}

interface PrintableInvoiceProps {
    data: InvoiceData;
}

/**
 * Printable Invoice Component
 * Optimized for A4 printing with proper page breaks
 */
export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
    ({ data }, ref) => {
        return (
            <PrintLayout ref={ref} title={`فاتورة رقم ${data.invoice_number}`}>
                {/* Invoice Info */}
                <div className="print-grid-2 avoid-break" style={{ marginBottom: '24pt' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8pt 0', fontSize: '14pt' }}>معلومات الفاتورة</h3>
                        <p style={{ margin: '4pt 0' }}>
                            <strong>رقم الفاتورة:</strong> {data.invoice_number}
                        </p>
                        <p style={{ margin: '4pt 0' }}>
                            <strong>التاريخ:</strong> {data.invoice_date}
                        </p>
                        {data.due_date && (
                            <p style={{ margin: '4pt 0' }}>
                                <strong>تاريخ الاستحقاق:</strong> {data.due_date}
                            </p>
                        )}
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 8pt 0', fontSize: '14pt' }}>معلومات العميل</h3>
                        <p style={{ margin: '4pt 0' }}>
                            <strong>الاسم:</strong> {data.customer_name}
                        </p>
                        {data.customer_address && (
                            <p style={{ margin: '4pt 0' }}>
                                <strong>العنوان:</strong> {data.customer_address}
                            </p>
                        )}
                        {data.customer_phone && (
                            <p style={{ margin: '4pt 0' }}>
                                <strong>الهاتف:</strong> {data.customer_phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Invoice Items Table */}
                <table style={{ marginBottom: '24pt' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}>#</th>
                            <th style={{ width: '45%' }}>الوصف</th>
                            <th style={{ width: '15%' }}>الكمية</th>
                            <th style={{ width: '17.5%' }}>السعر</th>
                            <th style={{ width: '17.5%' }}>المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={item.id} className="table-row">
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'left' }}>{item.unit_price.toFixed(2)}</td>
                                <td style={{ textAlign: 'left' }}>{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="avoid-break" style={{ marginRight: 'auto', width: '40%' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ border: 'none', textAlign: 'right', padding: '4pt 8pt' }}>
                                    <strong>المجموع الفرعي:</strong>
                                </td>
                                <td style={{ border: 'none', textAlign: 'left', padding: '4pt 8pt' }}>
                                    {data.subtotal.toFixed(2)}
                                </td>
                            </tr>

                            {data.discount && data.discount > 0 && (
                                <tr>
                                    <td style={{ border: 'none', textAlign: 'right', padding: '4pt 8pt' }}>
                                        <strong>الخصم:</strong>
                                    </td>
                                    <td style={{ border: 'none', textAlign: 'left', padding: '4pt 8pt', color: '#d32f2f' }}>
                                        -{data.discount.toFixed(2)}
                                    </td>
                                </tr>
                            )}

                            {data.tax && data.tax > 0 && (
                                <tr>
                                    <td style={{ border: 'none', textAlign: 'right', padding: '4pt 8pt' }}>
                                        <strong>الضريبة {data.tax_rate ? `(${data.tax_rate}%)` : ''}:</strong>
                                    </td>
                                    <td style={{ border: 'none', textAlign: 'left', padding: '4pt 8pt' }}>
                                        {data.tax.toFixed(2)}
                                    </td>
                                </tr>
                            )}

                            <tr style={{ borderTop: '2px solid #000' }}>
                                <td style={{ border: 'none', textAlign: 'right', padding: '8pt 8pt', fontSize: '14pt' }}>
                                    <strong>الإجمالي:</strong>
                                </td>
                                <td style={{ border: 'none', textAlign: 'left', padding: '8pt 8pt', fontSize: '14pt' }}>
                                    <strong>{data.total.toFixed(2)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {data.notes && (
                    <div className="avoid-break" style={{ marginTop: '24pt', padding: '12pt', backgroundColor: '#f5f5f5' }}>
                        <h4 style={{ margin: '0 0 8pt 0', fontSize: '12pt' }}>ملاحظات:</h4>
                        <p style={{ margin: 0, fontSize: '10pt' }}>{data.notes}</p>
                    </div>
                )}

                {/* Payment Terms */}
                {data.payment_terms && (
                    <div className="avoid-break" style={{ marginTop: '16pt' }}>
                        <h4 style={{ margin: '0 0 8pt 0', fontSize: '12pt' }}>شروط الدفع:</h4>
                        <p style={{ margin: 0, fontSize: '10pt' }}>{data.payment_terms}</p>
                    </div>
                )}
            </PrintLayout>
        );
    }
);

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
