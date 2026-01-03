import React, { forwardRef } from 'react';
import PrintLayout from '@/shared/components/print/PrintLayout';

interface ReportSection {
    title: string;
    content: React.ReactNode;
}

interface PrintableReportProps {
    title: string;
    dateRange?: string;
    summary?: string;
    sections: ReportSection[];
    footer?: string;
}

/**
 * Printable Report Component
 * For business reports with multiple sections
 */
export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
    ({ title, dateRange, summary, sections, footer }, ref) => {
        return (
            <PrintLayout ref={ref} title={title}>
                {/* Date Range */}
                {dateRange && (
                    <div className="avoid-break" style={{ marginBottom: '16pt', textAlign: 'center', fontSize: '11pt', color: '#666' }}>
                        {dateRange}
                    </div>
                )}

                {/* Summary */}
                {summary && (
                    <div className="avoid-break" style={{ marginBottom: '24pt', padding: '12pt', backgroundColor: '#f5f5f5', borderRight: '4px solid #2196f3' }}>
                        <h3 style={{ margin: '0 0 8pt 0', fontSize: '14pt' }}>ملخص التقرير</h3>
                        <p style={{ margin: 0, fontSize: '11pt' }}>{summary}</p>
                    </div>
                )}

                {/* Report Sections */}
                {sections.map((section, index) => (
                    <div key={index} className="avoid-break" style={{ marginBottom: '24pt' }}>
                        <h3 style={{ margin: '0 0 12pt 0', fontSize: '14pt', borderBottom: '2px solid #ddd', paddingBottom: '8pt' }}>
                            {section.title}
                        </h3>
                        <div>{section.content}</div>
                    </div>
                ))}

                {/* Footer */}
                {footer && (
                    <div className="avoid-break" style={{ marginTop: '32pt', padding: '12pt', backgroundColor: '#f5f5f5', fontSize: '10pt', textAlign: 'center' }}>
                        {footer}
                    </div>
                )}
            </PrintLayout>
        );
    }
);

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
